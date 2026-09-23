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

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navTabs = document.querySelector('.nav-tabs');
    menuBtn.classList.toggle('active');
    navTabs.classList.toggle('active');
    document.body.style.overflow = navTabs.classList.contains('active') ? 'hidden' : '';
}

// Contact Form Handling
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const formStatus = document.getElementById('formStatus');
    
    // Validate form
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    if (!name || !email || !message) {
        showFormStatus('error', 'Bitte füllen Sie alle Pflichtfelder aus.');
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormStatus('error', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return false;
    }

    // Format email content
    const formattedMessage = `${message}

Name: ${name}
E-Mail: ${email}
Telefon: ${phone || 'Nicht angegeben'}`;

    // Try to send email using mailto first
    const mailtoUrl = `mailto:kreutzer.gasthaus@hotmail.com?subject=Kontaktanfrage von ${encodeURIComponent(name)}&body=${encodeURIComponent(formattedMessage)}`;
    
    // Create a hidden link and try to open it
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
        // Try to open the email client
        link.click();
        // Clear the form
        form.reset();
    } catch (error) {
        // If mailto fails, show alternative contact methods
        showFormStatus('error', `
            <p>Es gab ein Problem beim Öffnen Ihres E-Mail-Programms.</p>
            <p>Bitte senden Sie uns eine E-Mail direkt an:</p>
            <p><strong>kreutzer.gasthaus@hotmail.com</strong></p>
            <p>Oder rufen Sie uns an unter: <strong>+43 (0) 2872 6690</strong></p>
        `);
    }
    
    document.body.removeChild(link);
    return false;
}

function showFormStatus(type, message) {
    const formStatus = document.getElementById('formStatus');
    formStatus.style.display = 'block';
    formStatus.style.padding = '15px';
    formStatus.style.borderRadius = '8px';
    formStatus.style.marginTop = '20px';
    
    if (type === 'error') {
        formStatus.style.backgroundColor = '#ffebee';
        formStatus.style.color = '#c62828';
        formStatus.style.border = '1px solid #ffcdd2';
    } else {
        formStatus.style.backgroundColor = '#e8f5e9';
        formStatus.style.color = '#2e7d32';
        formStatus.style.border = '1px solid #c8e6c9';
    }
    
    formStatus.innerHTML = message;
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

    // Close mobile menu when clicking a tab
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const menuBtn = document.querySelector('.mobile-menu-btn');
                const navTabs = document.querySelector('.nav-tabs');
                menuBtn.classList.remove('active');
                navTabs.classList.remove('active');
                document.body.style.overflow = '';
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