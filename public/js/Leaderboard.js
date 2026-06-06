document.addEventListener('DOMContentLoaded', function() {
    const timeTabs = document.querySelectorAll('.tmblModeT');
    const clickTabs = document.querySelectorAll('.tmblModeG');
    const deleteScoreBtn = document.querySelector('.deleteScore');
    const confirmDeletePopup = document.querySelector('.BackGroundBlurDisplayDelScore');
    const confirmDeleteDialog = document.querySelector('.KotakUtamaDisplayDelScore');
    const confirmDeleteBtn = document.querySelector('.tmblAcceptS');
    const cancelDeleteBtn = document.querySelector('.tmblUnAcceptS');
    const userRankLoading = document.querySelector('.userRankLoading');
    const userRankData = document.querySelector('.userRankData');
    
    let currentTimeMode = document.querySelector('.tmblModeT.active').dataset.timemode;
    let currentClickMode = document.querySelector('.tmblModeG.active').dataset.clickmode;
    
    if (confirmDeletePopup) {
        confirmDeletePopup.style.display = 'none';
    }
    
    function updateLeaderboard() {
        currentTimeMode = document.querySelector('.tmblModeT.active').dataset.timemode;
        currentClickMode = document.querySelector('.tmblModeG.active').dataset.clickmode;
        
        document.querySelectorAll('.dislpayLeaderboard').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetLeaderboard = document.getElementById(`leaderboard-${currentTimeMode}-${currentClickMode}`);
        if (targetLeaderboard) {
            targetLeaderboard.classList.add('active');
            console.log(`Showing leaderboard: leaderboard-${currentTimeMode}-${currentClickMode}`);
        } else {
            console.error(`Leaderboard not found: leaderboard-${currentTimeMode}-${currentClickMode}`);
        }
        
        fetchUserRank();
    }
    
    function fetchUserRank() {
        userRankLoading.style.display = 'block';
        userRankData.style.display = 'none';
        deleteScoreBtn.style.display = 'none';
        
        fetch(`/leaderboard/api/user/rank?timemode=${currentTimeMode}&clickmode=${currentClickMode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user rank');
                }
                return response.json();
            })
            .then(data => {
                userRankLoading.style.display = 'none';
                userRankData.style.display = 'flex';
                
                if (data.hasScore) {
                    document.querySelector('.user-rank').textContent = data.rank || '-';
                    document.querySelector('.user-name').textContent = data.username || '-';
                    document.querySelector('.user-score').textContent = data.score || '-';
                    deleteScoreBtn.style.display = 'inline-block';
                } else {
                    document.querySelector('.user-rank').textContent = '-';
                    document.querySelector('.user-name').textContent = data.username || '-';
                    document.querySelector('.user-score').textContent = '-';
                    deleteScoreBtn.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                userRankLoading.style.display = 'none';
                userRankData.style.display = 'block';
                document.querySelector('.user-rank').textContent = '-';
                document.querySelector('.user-name').textContent = '-';
                document.querySelector('.user-score').textContent = '-';
                deleteScoreBtn.style.display = 'none';
            });
    }
    
    function deleteUserScore() {
        fetch('/leaderboard/api/user/scores', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timemode: currentTimeMode,
                clickmode: currentClickMode
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete score');
            }
            return response.json();
        })
        .then(data => {
            console.log('Score deleted:', data);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete score. Please try again.');
        })
        .finally(() => {
            hideDeleteConfirmation();
        });
    }
    
    function showDeleteConfirmation() {
        if (confirmDeletePopup) {
            confirmDeletePopup.style.display = 'flex';
            if (confirmDeleteDialog) {
                confirmDeleteDialog.style.animation = 'none';
                void confirmDeleteDialog.offsetWidth;
                confirmDeleteDialog.style.animation = 'fadeInScale 0.3s ease forwards';
            }
        }
    }
    
    function hideDeleteConfirmation() {
        if (confirmDeleteDialog && confirmDeletePopup) {
            confirmDeleteDialog.style.animation = 'fadeOutScale 0.3s ease';
            
            setTimeout(() => {
                confirmDeletePopup.style.display = 'none';
            }, 300);
        }
    }
    
    timeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            timeTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateLeaderboard();
        });
    });
    
    clickTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            clickTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateLeaderboard();
        });
    });
    
    if (deleteScoreBtn) {
        deleteScoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showDeleteConfirmation();
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            deleteUserScore();
        });
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            hideDeleteConfirmation();
        });
    }
    
    updateLeaderboard();
});