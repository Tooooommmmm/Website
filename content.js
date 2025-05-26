// Tab Navigation Function
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageId).classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');

    // Smooth scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Contact Form Validation and Formatting
function validateAndFormatForm(event) {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    if (!name || !email || !message) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        event.preventDefault();
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        event.preventDefault();
        return false;
    }

    // Format message
    const formattedMessage = `${message}\n\nLG\n${name}\n${phone}\n${email}`;
    document.getElementById('formatted-message').value = formattedMessage;

    return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize cards animation
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Add scroll animations for feature cards
    window.addEventListener('scroll', function() {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const cardVisible = 150;
            
            if (cardTop < window.innerHeight - cardVisible) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0.8';
                card.style.transform = 'translateY(20px)';
            }
        });
    });

    // Menu Image Lightbox
    const menuImage = document.querySelector('.menu-card-image img');
    if (menuImage) {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.style.display = 'none';
        lightbox.style.position = 'fixed';
        lightbox.style.top = '0';
        lightbox.style.left = '0';
        lightbox.style.width = '100%';
        lightbox.style.height = '100%';
        lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        lightbox.style.zIndex = '1000';
        lightbox.style.display = 'none';
        lightbox.style.justifyContent = 'center';
        lightbox.style.alignItems = 'center';
        lightbox.style.cursor = 'pointer';

        const lightboxImg = document.createElement('img');
        lightboxImg.style.maxHeight = '90%';
        lightboxImg.style.maxWidth = '90%';
        lightboxImg.style.objectFit = 'contain';
        lightboxImg.style.border = '3px solid white';
        lightboxImg.style.borderRadius = '5px';

        lightbox.appendChild(lightboxImg);
        document.body.appendChild(lightbox);

        // Open lightbox on image click
        menuImage.addEventListener('click', function() {
            lightboxImg.src = this.src;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });

        // Close lightbox on click
        lightbox.addEventListener('click', function() {
            this.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
});