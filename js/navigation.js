// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links with hash (#) in their href
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    // Add click event listener to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            const navHeight = document.querySelector('.nav-container').offsetHeight;
            
            // If the clicked link is the one that should scroll to top
            if (targetId === '#about') {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            } else if (targetSection) {
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }

            // Update active class
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Update active navigation link based on scroll position
    function updateActiveNavLink() {
        const navHeight = document.querySelector('.nav-container').offsetHeight;
        const sections = Array.from(document.querySelectorAll('section[id]'));
        
        let currentSection = null;
        let maxVisibility = 0;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const viewportHeight = window.innerHeight;

            const visibleHeight = Math.min(viewportHeight, sectionTop + sectionHeight) - 
                                 Math.max(0, sectionTop);

            const adjustedVisibility = visibleHeight > 0 ? 
                visibleHeight / sectionHeight * (1 - sectionTop / (viewportHeight * 2)) : 
                0;

            if (adjustedVisibility > maxVisibility) {
                maxVisibility = adjustedVisibility;
                currentSection = section;
            }
        });

        if (currentSection) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });

            const correspondingLink = document.querySelector(`.nav-links a[href="#${currentSection.id}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', updateActiveNavLink);
    window.addEventListener('resize', updateActiveNavLink);
    setTimeout(updateActiveNavLink, 100);
});
