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

    // --- Hero Slider via Canvas Scrollytelling Add-on ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const canvas = document.getElementById("hero-canvas");
        const context = canvas.getContext("2d");

        const frameCount = 240;
        const currentFrame = index => (
            `ezgif-301be2621961b6cf-jpg/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
        );

        const images = [];
        const imageSeq = {
            frame: 0
        };

        // Preload frames
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }

        if (images[0]) {
            images[0].onload = render;
        }

        let cachedBgColor = null;

        function render() {
            const dpr = window.devicePixelRatio || 1;
            // Adjust canvas resolution for high-DPI (Retina/iPhone) screens
            if (canvas.width !== window.innerWidth * dpr || canvas.height !== window.innerHeight * dpr) {
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                // Keep the visual size bounded to the viewport
                canvas.style.width = window.innerWidth + 'px';
                canvas.style.height = window.innerHeight + 'px';
                
                // Force top-tier smoothing only upon resize to save GPU cycles
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
            }

            const frameIndex = Math.round(imageSeq.frame);
            const img = images[frameIndex];
            if (!img || !img.complete) return;

            // Cache the background sampling to avoid 60fps GPU pipeline stalls
            if (!cachedBgColor) {
                try {
                    context.drawImage(img, parseInt(img.width/2), 5, 10, 10, 0, 0, 1, 1);
                    const p = context.getImageData(0, 0, 1, 1).data;
                    cachedBgColor = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
                } catch(e) {
                    cachedBgColor = "#e6d3c0"; // Safe fallback
                }
            }
            context.fillStyle = cachedBgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // "object-fit: cover" equivalent behavior
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const isMobile = window.innerWidth < 768;
            
            // Fix iPhone cropping issue: 
            // - On mobile (tall screen), if we use "cover", the box gets chopped horizontally. Use "contain" to preserve the whole box.
            // - On desktop (wide screen), "cover" naturally fits 16:9 perfectly without chopping subjects.
            const ratio = isMobile ? Math.min(hRatio, vRatio) * 1.15 : Math.max(hRatio, vRatio);
            
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;  
            
            context.drawImage(img, 0, 0, img.width, img.height,
                              centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        }

        // Draw initially to avoid blank canvas waiting for scroll
        setTimeout(render, 100);
        window.addEventListener('resize', render);

        // Sequence Animation synced to scroll
        gsap.to(imageSeq, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5
            },
            onUpdate: render
        });

        // Set up the texts to fade in and out as we scroll
        const slides = document.querySelectorAll('.slide');
        const numSlides = slides.length;
        
        // Hide all initially — we will gently fade them in
        gsap.set(slides, { opacity: 0, visibility: 'hidden', y: 30 });
        
        // Ensure first slide is visible initially
        gsap.set(slides[0], { opacity: 1, visibility: 'visible', y: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8 // Add a slight delay interpolate for buttery smooth animation
            }
        });

        // Loop through slides and create enter/leave animations
        slides.forEach((slide, i) => {
            const slideDuration = 10; 
            
            if(i === 0) {
                // First slide just fades out
                tl.to(slide, { opacity: 0, y: -20, duration: slideDuration * 0.5 }, slideDuration * 0.5);
            } else {
                // Set initial hidden position slightly lower
                gsap.set(slide, { y: 20 });

                const startTime = i * slideDuration;
                // Fade in beautifully, emerging directly up
                tl.to(slide, { opacity: 1, visibility: 'visible', y: 0, duration: slideDuration * 0.3 }, startTime - (slideDuration * 0.3))
                
                // Fade out softly
                if (i !== numSlides - 1) {
                    tl.to(slide, { opacity: 0, y: -20, duration: slideDuration * 0.4 }, startTime + (slideDuration * 0.6));
                }
            }
        });
    }

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
