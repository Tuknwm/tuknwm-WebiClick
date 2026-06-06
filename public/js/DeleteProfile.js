document.addEventListener('DOMContentLoaded', function() {
  const deleteAccountBtn = document.querySelector('.DeleteAcc');
  const confirmationDialog = document.querySelector('.BackGroundBlurDisplayDel');
  const dialogBox = document.querySelector('.KotakUtamaDisplayDel');
  const yesButton = document.querySelector('.tmblAccept');
  const noButton = document.querySelector('.tmblUnAccept');
  
  if (confirmationDialog) {
    confirmationDialog.style.display = 'none';
  }
  
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirmationDialog) {
        confirmationDialog.style.display = 'flex';
        dialogBox.style.animation = 'none';
        void dialogBox.offsetWidth;
        dialogBox.style.animation = 'fadeInScale 0.3s ease forwards';
      }
    });
  }
  
  if (yesButton) {
    yesButton.addEventListener('click', function() {
      deleteAccount();
    });
  }
  
  if (noButton) {
    noButton.addEventListener('click', function() {
      if (dialogBox && confirmationDialog) {
        dialogBox.style.animation = 'fadeOutScale 0.3s ease';
        
        setTimeout(() => {
          confirmationDialog.style.display = 'none';
        }, 300);
      }
    });
  }
});

function deleteAccount() {
  fetch('/api/user/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed To Delete Account');
    }
    return response.json();
  })
  .then(data => {
    window.location.href = '/login';
  })
  .catch(error => {
    console.error('Error deleting account:', error);
    alert('Failed To Delete Account. Please Try Again.');
  });
}