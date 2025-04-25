// Feather icons library for icons
feather.replace();

// Project carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const indicators = Array.from(document.querySelectorAll('.carousel-indicator'));
    
    let currentIndex = 0;
    const cardWidth = cards[0].getBoundingClientRect().width;
    
    // Set initial position
    function updateCarousel() {
        track.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('current');
            } else {
                indicator.classList.remove('current');
            }
        });
        
        // Update 3D project for the current visible card
        updateActiveProject(currentIndex);
    }
    
    // Handle next button click
    nextButton.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });
    
    // Handle prev button click
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });
    
    // Handle indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
});