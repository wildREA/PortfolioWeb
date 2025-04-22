// GitHub Stats Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('github-stats-modal');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalContent = modal.querySelector('.modal-content');
    const profileImage = document.querySelector('.profile-image');

    // Open modal when profile image is clicked
    profileImage.addEventListener('click', function() {
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        modal.classList.add('active');
        
        // Refresh feather icons in the modal
        feather.replace();
    });

    // Close modal functions
    function closeModal() {
        document.body.style.overflow = ''; // Re-enable scrolling
        modal.classList.remove('active');
    }

    // Close modal when clicking outside the modal content
    modalOverlay.addEventListener('click', closeModal);
    
    // Prevent closing when clicking on the content itself
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Close modal when clicking anywhere else in the modal (outside the content)
    modal.addEventListener('click', closeModal);

    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});