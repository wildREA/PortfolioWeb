// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links with hash (#) in their href
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    // Add click event listener to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default anchor click behavior
            e.preventDefault();
            
            // Get the target section ID from the href attribute
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Calculate scroll position with offset for fixed header
                const navHeight = document.querySelector('.nav-container').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - navHeight;
                
                // Smooth scroll to target section
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update active link after scrolling
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Update active navigation link based on scroll position
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY;
        const navHeight = document.querySelector('.nav-container').offsetHeight;
        const sections = Array.from(document.querySelectorAll('section[id]'));
        
        // Find the section that's currently most visible in the viewport
        let currentSection = null;
        let maxVisibility = 0;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const viewportHeight = window.innerHeight;
            
            // Calculate how much of the section is visible in the viewport
            const visibleHeight = Math.min(viewportHeight, sectionTop + sectionHeight) - 
                                 Math.max(0, sectionTop);
            
            // Adjust visibility calculation to favor sections near the top
            const adjustedVisibility = visibleHeight > 0 ? 
                                      visibleHeight / sectionHeight * (1 - sectionTop / (viewportHeight * 2)) : 
                                      0;
            
            if (adjustedVisibility > maxVisibility) {
                maxVisibility = adjustedVisibility;
                currentSection = section;
            }
        });
        
        if (currentSection) {
            // Remove active class from all links
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to current section link
            const correspondingLink = document.querySelector(`.nav-links a[href="#${currentSection.id}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    }
    
    // Add scroll event listener to update active nav link
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Add resize event listener to handle window resizing
    window.addEventListener('resize', updateActiveNavLink);
    
    // Call once on page load (after a short delay to let elements render)
    setTimeout(updateActiveNavLink, 100);
});