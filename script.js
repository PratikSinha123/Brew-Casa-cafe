/* ============================================
   SONY WH-1000XM6
   Main JavaScript — 3D Image Sequence & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Scroll Effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile nav toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
    }

    // --- Scrollytelling Canvas Animation (GSAP) ---
    // Ensure GSAP and ScrollTrigger are loaded via CDN in HTML
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const canvas = document.getElementById("hero-canvas");
        const context = canvas.getContext("2d");

        // We have 240 frames in the specific folder
        const frameCount = 240;
        
        // Map the index to the frame filename format: ezgif-frame-001.jpg
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

        // Draw initial frame as soon as it loads
        if (images[0]) {
            images[0].onload = render;
        }

        function render() {
            // Check canvas sizing
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            // Fill with perfectly matching dark background #050505
            context.fillStyle = "#050505";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            const img = images[imageSeq.frame];
            if (!img || !img.complete) return;
            
            // "object-fit: contain" math for Canvas
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio  = Math.min(hRatio, vRatio);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;  
            
            context.drawImage(img, 0, 0, img.width, img.height,
                              centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        }

        // Update canvas on scroll
        gsap.to(imageSeq, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: "#scrollytelling-section",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5 // Smoothing factor
            },
            onUpdate: render
        });

        // Initialize beats to opacity 0 (except beat 1 which starts visible)
        gsap.set("#beat-1", { opacity: 1, y: 0 });
        gsap.set(["#beat-2", "#beat-3", "#beat-4", "#beat-5"], { opacity: 0, y: 50 });

        // Storytelling text beats mapped to the timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#scrollytelling-section",
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });

        tl.to("#scroll-indicator", { opacity: 0, duration: 0.5 }, 0)
          
          // Beat 1 Out
          .to("#beat-1", { opacity: 0, y: -50, duration: 1 }, 1)

          // Beat 2 In / Out
          .to("#beat-2", { opacity: 1, y: 0, duration: 1.5 }, 2)
          .to("#beat-2", { opacity: 0, y: -50, duration: 1 }, 4)

          // Beat 3 In / Out
          .to("#beat-3", { opacity: 1, y: 0, duration: 1.5 }, 5)
          .to("#beat-3", { opacity: 0, y: -50, duration: 1 }, 6.5)

          // Beat 4 In / Out
          .to("#beat-4", { opacity: 1, y: 0, duration: 1.5 }, 7.5)
          .to("#beat-4", { opacity: 0, y: -50, duration: 1 }, 9)

          // Beat 5 In
          .to("#beat-5", { opacity: 1, y: 0, duration: 1.5 }, 10);

        window.addEventListener('resize', render);
    }

    // --- General Scroll Animations (for gallery) ---
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

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#") return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

});
