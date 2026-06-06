const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const User = require('../models/user');

// Replaces MongoDB aggregate: group by user, get max score, sort desc, limit
async function getTopScores(timemode, clickmode, limit = 10) {
    const scores = await Score.find({ timemode, clickmode });
    const grouped = {};
    scores.forEach(s => {
        const uid = String(s.user);
        if (!grouped[uid] || grouped[uid].score < s.score) {
            grouped[uid] = { userId: uid, score: s.score };
        }
    });
    const sorted = Object.values(grouped)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return Promise.all(sorted.map(async (item) => {
        const user = await User.findById(item.userId);
        return {
            score: item.score,
            namaUser: user ? user.username : 'Unknown User',
            userId: item.userId
        };
    }));
}

router.post('/saveScore', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!req.body || !req.body.score || !req.body.timemode) {
            return res.status(400).json({
                error: 'Missing required fields',
                received: req.body,
                headers: req.headers['content-type']
            });
        }

        const newScore = new Score({
            score: Number(req.body.score),
            timemode: Number(req.body.timemode),
            clickmode: req.body.clickmode || 'mouse',
            user: req.session.user._id
        });

        await newScore.save();
        res.status(200).json({
            message: 'Score saved successfully',
            savedScore: newScore
        });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const [
            scores5sMouse, scores5sKeyboard,
            scores10sMouse, scores10sKeyboard,
            scores15sMouse, scores15sKeyboard
        ] = await Promise.all([
            getTopScores(5, 'mouse'),
            getTopScores(5, 'keyboard'),
            getTopScores(10, 'mouse'),
            getTopScores(10, 'keyboard'),
            getTopScores(15, 'mouse'),
            getTopScores(15, 'keyboard'),
        ]);

        res.render('leaderboard', {
            scores5sMouse, scores5sKeyboard,
            scores10sMouse, scores10sKeyboard,
            scores15sMouse, scores15sKeyboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.render('leaderboard', {
            scores5sMouse: [], scores5sKeyboard: [],
            scores10sMouse: [], scores10sKeyboard: [],
            scores15sMouse: [], scores15sKeyboard: []
        });
    }
});

router.get('/api/scores', async (req, res) => {
    try {
        const { timemode, clickmode } = req.query;

        if (!timemode || !clickmode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const timeModeNum = Number(timemode);

        if (![5, 10, 15].includes(timeModeNum) || !['mouse', 'keyboard'].includes(clickmode)) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        const scores = await getTopScores(timeModeNum, clickmode);
        res.json(scores.map(s => ({ score: s.score, username: s.namaUser })));
    } catch (error) {
        console.error('Error fetching scores:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/user/scores', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.session.user._id;
        const clickmode = req.query.clickmode || 'mouse';

        if (!['mouse', 'keyboard'].includes(clickmode)) {
            return res.status(400).json({ error: 'Invalid click mode' });
        }

        const [scores5s, scores10s, scores15s] = await Promise.all([
            Score.findOne({ user: userId, timemode: 5, clickmode }).sort({ score: -1 }),
            Score.findOne({ user: userId, timemode: 10, clickmode }).sort({ score: -1 }),
            Score.findOne({ user: userId, timemode: 15, clickmode }).sort({ score: -1 }),
        ]);

        res.json({
            scores5s: scores5s ? scores5s.score : '-',
            scores10s: scores10s ? scores10s.score : '-',
            scores15s: scores15s ? scores15s.score : '-'
        });
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

router.get('/api/user/rank', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = String(req.session.user._id);
        let { timemode, clickmode } = req.query;

        if (!timemode || !clickmode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const timeModeNum = Number(timemode);

        if (![5, 10, 15].includes(timeModeNum) || !['mouse', 'keyboard'].includes(clickmode)) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        const allScores = await getTopScores(timeModeNum, clickmode, 10000);
        const userRank = allScores.findIndex(s => s.userId === userId);

        const userBestScore = await Score.findOne({
            user: userId,
            timemode: timeModeNum,
            clickmode
        }).sort({ score: -1 });

        res.json({
            rank: userRank !== -1 ? userRank + 1 : null,
            score: userBestScore ? userBestScore.score : null,
            username: req.session.user.username,
            hasScore: !!userBestScore
        });
    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({ error: 'Failed to fetch rank' });
    }
});

router.delete('/api/user/scores', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.session.user._id;
        let { timemode, clickmode } = req.body;

        if (!timemode || !clickmode) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const timeModeNum = Number(timemode);

        if (![5, 10, 15].includes(timeModeNum) || !['mouse', 'keyboard'].includes(clickmode)) {
            return res.status(400).json({
                error: 'Invalid parameters',
                received: { timemode, clickmode }
            });
        }

        const result = await Score.deleteMany({
            user: userId,
            timemode: timeModeNum,
            clickmode
        });

        res.json({
            message: 'Scores deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting scores:', error);
        res.status(500).json({ error: 'Failed to delete scores' });
    }
});

module.exports = router;
