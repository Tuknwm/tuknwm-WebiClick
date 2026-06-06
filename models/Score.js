const db = require('../db');

// Supports .sort() chaining then await — returns single doc
class ScoreFindOneQuery {
    constructor(query) {
        this._query = query;
        this._sortObj = null;
    }

    sort(obj) { this._sortObj = obj; return this; }

    then(onFulfilled, onRejected) {
        const p = db.scores.findAsync(this._query).then(docs => {
            if (!docs.length) return null;
            if (this._sortObj) {
                const [key, dir] = Object.entries(this._sortObj)[0];
                docs.sort((a, b) => dir === -1 ? (b[key] - a[key]) : (a[key] - b[key]));
            }
            return docs[0];
        });
        return p.then(onFulfilled, onRejected);
    }

    catch(onRejected) { return this.then(null, onRejected); }
}

function Score(data) {
    Object.assign(this, data);
}

Score.prototype.save = async function () {
    const data = Object.assign({}, this);
    if (!data.createdAt) data.createdAt = new Date();
    const doc = await db.scores.insertAsync(data);
    Object.assign(this, doc);
    return this;
};

Score.find = function (query) {
    return db.scores.findAsync(query || {});
};

Score.findOne = function (query) {
    return new ScoreFindOneQuery(query);
};

Score.deleteMany = async function (query) {
    const count = await db.scores.removeAsync(query, { multi: true });
    return { deletedCount: count };
};

module.exports = Score;
