// Skills Section Interaction
document.addEventListener('DOMContentLoaded', function() {
    // Get all skill category cards
    const skillCards = document.querySelectorAll('.skill-category-card');
    
    // Add click event to each card header
    skillCards.forEach(card => {
        const header = card.querySelector('.skill-card-header');
        
        header.addEventListener('click', () => {
            // Toggle the active state of the clicked card
            card.classList.toggle('active');
            
            // Optional: Close other cards when opening a new one
            // skillCards.forEach(otherCard => {
            //     if (otherCard !== card) {
            //         otherCard.classList.remove('active');
            //     }
            // });
        });
    });
});