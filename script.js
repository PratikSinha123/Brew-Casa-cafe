/* ============================================
   BREW CASA — Brewing Happiness
   Main JavaScript — Slider, Interactions, Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 1500);
    });

    // Fallback to hide preloader
    setTimeout(() => {
        preloader.classList.add('loaded');
    }, 4000);

    // --- Navigation ---
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // Scroll handler for navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile nav toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile nav on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                allNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // --- Hero Slider ---
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dots = document.querySelectorAll('.slider-dot');
    const currentSlideEl = document.getElementById('current-slide');
    const dragProgress = document.getElementById('drag-progress');
    const dragHandle = document.getElementById('drag-handle');
    const dragTrack = document.querySelector('.drag-track');
    const heroSlider = document.getElementById('hero-slider');

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayInterval;
    let isTransitioning = false;

    function goToSlide(index, direction = 'next') {
        if (isTransitioning || index === currentIndex) return;
        isTransitioning = true;

        // Remove active from current slide
        slides[currentIndex].classList.remove('active');

        // Update index
        currentIndex = index;

        // Clamp index
        if (currentIndex >= totalSlides) currentIndex = 0;
        if (currentIndex < 0) currentIndex = totalSlides - 1;

        // Add active to new slide
        slides[currentIndex].classList.add('active');

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        // Update counter
        currentSlideEl.textContent = String(currentIndex + 1).padStart(2, '0');

        // Update drag bar position
        updateDragBar();

        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }

    function nextSlide() {
        goToSlide(currentIndex + 1, 'next');
    }

    function prevSlide() {
        goToSlide(currentIndex - 1, 'prev');
    }

    function updateDragBar() {
        const progress = ((currentIndex + 1) / totalSlides) * 100;
        dragProgress.style.width = progress + '%';
        dragHandle.style.left = progress + '%';
    }

    // Slider button events
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    // Dot click events
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.slide);
            goToSlide(slideIndex);
            resetAutoplay();
        });
    });

    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 2500);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    startAutoplay();

    // Pause on hover
    heroSlider.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    heroSlider.addEventListener('mouseleave', () => {
        startAutoplay();
    });

    // --- Drag / Swipe on Slider ---
    let isDragging = false;
    let startX = 0;
    let dragDelta = 0;

    heroSlider.addEventListener('mousedown', (e) => {
        // Don't start drag on buttons
        if (e.target.closest('.slider-btn') || e.target.closest('.slider-dot') ||
            e.target.closest('.slide-cta') || e.target.closest('.drag-handle')) return;

        isDragging = true;
        startX = e.clientX;
        dragDelta = 0;
        heroSlider.classList.add('dragging');
        clearInterval(autoplayInterval);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        dragDelta = e.clientX - startX;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        heroSlider.classList.remove('dragging');

        if (Math.abs(dragDelta) > 60) {
            if (dragDelta < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        startAutoplay();
    });

    // Touch support
    heroSlider.addEventListener('touchstart', (e) => {
        if (e.target.closest('.slider-btn') || e.target.closest('.slider-dot') ||
            e.target.closest('.slide-cta') || e.target.closest('.drag-handle')) return;

        isDragging = true;
        startX = e.touches[0].clientX;
        dragDelta = 0;
        clearInterval(autoplayInterval);
    }, { passive: true });

    heroSlider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        dragDelta = e.touches[0].clientX - startX;
    }, { passive: true });

    heroSlider.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;

        if (Math.abs(dragDelta) > 40) {
            if (dragDelta < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        startAutoplay();
    });

    // --- Drag Handle on Track ---
    let isHandleDragging = false;

    dragHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isHandleDragging = true;
        clearInterval(autoplayInterval);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isHandleDragging) return;

        const trackRect = dragTrack.getBoundingClientRect();
        let x = e.clientX - trackRect.left;
        x = Math.max(0, Math.min(x, trackRect.width));

        const percent = x / trackRect.width;
        const slideIndex = Math.round(percent * (totalSlides - 1));

        // Visual feedback
        dragProgress.style.width = (percent * 100) + '%';
        dragHandle.style.left = (percent * 100) + '%';

        goToSlide(slideIndex);
    });

    document.addEventListener('mouseup', () => {
        if (isHandleDragging) {
            isHandleDragging = false;
            updateDragBar();
            startAutoplay();
        }
    });

    // Drag track click
    dragTrack.addEventListener('click', (e) => {
        const trackRect = dragTrack.getBoundingClientRect();
        const x = e.clientX - trackRect.left;
        const percent = x / trackRect.width;
        const slideIndex = Math.round(percent * (totalSlides - 1));
        goToSlide(slideIndex);
        resetAutoplay();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoplay();
        }
    });

    // --- Menu Tab Switching ---
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuCards = document.querySelectorAll('.menu-card');

    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            // Update active tab
            menuTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter cards with animation
            menuCards.forEach((card, index) => {
                if (card.dataset.category === category) {
                    card.classList.remove('hidden');
                    card.style.animationDelay = (index * 0.08) + 's';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // --- Scroll Animations ---
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // --- Counter Animation ---
    const counters = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                let current = 0;
                const increment = target / 60;
                const duration = 2000;
                const stepTime = duration / 60;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current) + '+';
                }, stepTime);

                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    // --- Bucket List Stagger Animation ---
    const bucketItems = document.querySelectorAll('.bucket-item');

    const bucketObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.parentElement.querySelectorAll('.bucket-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        // Keep a base transform string so that our tilt effect doesn't get overridden constantly.
                        // We will let the tilt effect manage the translation and rotation.
                        if(!item.classList.contains('initialized')) {
                            item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                            item.classList.add('initialized');
                        }
                    }, index * 100);
                });
                bucketObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    bucketItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // --- 3D INTERACTION LOGIC ---
        // Toggle completed check state
        item.addEventListener('click', () => {
            item.classList.toggle('checked');
            
            // Provide a quick feedback "pop" when checked
            item.style.transition = 'transform 0.15s ease-out';
            item.style.transform = 'perspective(1000px) scale(0.95)';
            
            setTimeout(() => {
                item.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                // Reset tilt on click pop to natural
                item.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
            }, 150);
        });

        // 3D Tilt Effect on mousemove
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            // Calculate mouse position relative to center of element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Normalize from -1 to 1 based on center
            const xNorm = (x - rect.width / 2) / (rect.width / 2);
            const yNorm = (y - rect.height / 2) / (rect.height / 2);
            
            const maxRotate = 8; // Max degrees of tilt
            const rotateX = -yNorm * maxRotate; 
            const rotateY = xNorm * maxRotate;

            item.style.transition = 'none'; // Disable transition for instant follow
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });

    if (bucketItems.length > 0) {
        bucketObserver.observe(bucketItems[0]);
    }

    // --- Smooth Scroll for anchor links ---
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

    // Initialize drag bar position
    updateDragBar();
});
