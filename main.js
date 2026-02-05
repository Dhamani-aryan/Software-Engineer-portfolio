/* ================================================
   MAIN.JS — Animations, Interactivity, Theme System
   Custom cursor, typewriter, scroll animations, etc.
   ================================================ */

(function() {
    'use strict';

    // ==================== LOADING SCREEN ====================
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loaderBar');
    let loadProgress = 0;

    const loadInterval = setInterval(function() {
        loadProgress += Math.random() * 15 + 5;
        if (loadProgress > 100) loadProgress = 100;
        loaderBar.style.width = loadProgress + '%';

        if (loadProgress >= 100) {
            clearInterval(loadInterval);
            setTimeout(function() {
                loader.classList.add('hidden');
                document.body.style.overflow = 'auto';
                initAnimations();
            }, 500);
        }
    }, 150);

    // Prevent scroll during loading
    document.body.style.overflow = 'hidden';

    // ==================== CUSTOM CURSOR ====================
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    if (cursorDot && cursorRing) {
        document.addEventListener('mousemove', function(e) {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.left = cursorX + 'px';
            cursorDot.style.top = cursorY + 'px';
        });

        // Smooth ring follow
        function animateCursor() {
            ringX += (cursorX - ringX) * 0.15;
            ringY += (cursorY - ringY) * 0.15;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor hover effect on interactive elements
        var interactiveElements = document.querySelectorAll('a, button, .tilt-card, input, textarea, .filter-btn, .magnetic-btn');
        interactiveElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                cursorDot.classList.add('hover');
                cursorRing.classList.add('hover');
            });
            el.addEventListener('mouseleave', function() {
                cursorDot.classList.remove('hover');
                cursorRing.classList.remove('hover');
            });
        });
    }

    // ==================== MAGNETIC BUTTONS ====================
    var magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(function(btn) {
        btn.addEventListener('mousemove', function(e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
        });

        btn.addEventListener('mouseleave', function() {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ==================== THEME TOGGLE ====================
    var themeToggle = document.getElementById('themeToggle');
    var savedTheme = localStorage.getItem('portfolio-theme') || 'dark';

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);

        // Update Three.js scene colors
        if (typeof window.updateThreeTheme === 'function') {
            window.updateThreeTheme();
        }
    });

    // ==================== NAVBAR ====================
    var navbar = document.getElementById('navbar');
    var navLinks = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('.section');

    // Scroll behavior — glassmorphism on scroll
    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section highlighting
        var currentSection = '';
        sections.forEach(function(section) {
            var sectionTop = section.offsetTop - 150;
            if (scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active');
            }
        });
    });

    // ==================== MOBILE MENU ====================
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    var mobileLinks = document.querySelectorAll('.mobile-link');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    mobileLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // ==================== SCROLL PROGRESS BAR ====================
    var scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY || window.pageYOffset;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = (scrollY / docHeight) * 100;
        scrollProgress.style.width = progress + '%';
    });

    // ==================== BACK TO TOP ====================
    var backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ==================== TYPEWRITER EFFECT ====================
    var typewriterEl = document.getElementById('typewriter');
    var phrases = [
        'scalable web applications.',
        'beautiful user interfaces.',
        'robust backend systems.',
        'open-source tools.',
        'cloud-native solutions.',
        'developer experiences.'
    ];
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typeSpeed = 80;

    function typewrite() {
        var currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400; // Pause before next phrase
        }

        setTimeout(typewrite, typeSpeed);
    }

    // Start typewriter after loader
    setTimeout(typewrite, 2000);

    // ==================== SCROLL REVEAL ANIMATIONS ====================
    function initAnimations() {
        // Reveal elements on scroll
        var revealElements = document.querySelectorAll('.reveal-up, .reveal-text');

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(function(el) {
            observer.observe(el);
        });

        // Animate skill bars on scroll
        var skillLevels = document.querySelectorAll('.skill-level');
        var skillObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var level = entry.target.getAttribute('data-level');
                    entry.target.style.setProperty('--level', level);
                    entry.target.classList.add('animate');
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        skillLevels.forEach(function(el) {
            skillObserver.observe(el);
        });

        // Animate stat counters
        var statNumbers = document.querySelectorAll('.stat-number');
        var statObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function(el) {
            statObserver.observe(el);
        });

        // Timeline line animation
        var timelineLine = document.getElementById('timelineLine');
        if (timelineLine) {
            var timelineObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var rect = entry.target.getBoundingClientRect();
                        var scrollPercent = Math.min(
                            1,
                            (window.innerHeight - rect.top) / (rect.height + window.innerHeight)
                        );
                        var afterEl = timelineLine.querySelector(':after') || timelineLine;
                        // Use scroll listener for continuous animation
                        function updateTimeline() {
                            var r = entry.target.getBoundingClientRect();
                            var pct = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (r.height + window.innerHeight * 0.5)));
                            timelineLine.style.setProperty('--progress', (pct * 100) + '%');
                            if (pct < 1) requestAnimationFrame(updateTimeline);
                        }
                        updateTimeline();
                    }
                });
            }, { threshold: 0 });

            var timeline = document.querySelector('.timeline');
            if (timeline) timelineObserver.observe(timeline);
        }
    }

    // Counter animation
    function animateCounter(element) {
        var target = parseInt(element.getAttribute('data-target'), 10);
        var duration = 2000;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out
            var ease = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.floor(ease * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(step);
    }

    // ==================== PROJECT FILTER ====================
    var filterBtns = document.querySelectorAll('.filter-btn');
    var projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Update active state
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var filter = btn.getAttribute('data-filter');

            projectCards.forEach(function(card) {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(function() {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ==================== 3D TILT CARDS ====================
    var tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;
            var rotateX = (y - centerY) / centerY * -8;
            var rotateY = (x - centerX) / centerX * 8;

            card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
        });

        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // ==================== CONTACT FORM ====================
    var contactForm = document.getElementById('contactForm');
    var formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic validation
            var inputs = contactForm.querySelectorAll('input, textarea');
            var valid = true;
            inputs.forEach(function(input) {
                if (!input.value.trim()) {
                    valid = false;
                    input.style.borderBottomColor = '#ef4444';
                    setTimeout(function() {
                        input.style.borderBottomColor = '';
                    }, 2000);
                }
            });

            // Email validation
            var emailInput = document.getElementById('email');
            if (emailInput && emailInput.value) {
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value)) {
                    valid = false;
                    emailInput.style.borderBottomColor = '#ef4444';
                }
            }

            if (valid) {
                // Simulate form submission
                var submitBtn = contactForm.querySelector('.form-submit');
                submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
                submitBtn.disabled = true;

                setTimeout(function() {
                    submitBtn.style.display = 'none';
                    formSuccess.classList.add('show');
                    contactForm.reset();

                    // Reset after 5s
                    setTimeout(function() {
                        formSuccess.classList.remove('show');
                        submitBtn.style.display = '';
                        submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
                        submitBtn.disabled = false;
                    }, 5000);
                }, 1500);
            }
        });
    }

    // ==================== SMOOTH SCROLL FOR NAV LINKS ====================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                var offsetTop = targetEl.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==================== SCROLL INDICATOR HIDE ====================
    var scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY || window.pageYOffset;
            if (scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
    }

    // ==================== FOOTER YEAR ====================
    var yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ==================== GSAP ANIMATIONS (if loaded) ====================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Parallax sections
        gsap.utils.toArray('.section').forEach(function(section) {
            var sectionTag = section.querySelector('.section-tag');
            if (sectionTag) {
                gsap.fromTo(sectionTag,
                    { x: -50, opacity: 0 },
                    {
                        x: 0,
                        opacity: 0.6,
                        duration: 1,
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            }
        });

        // Section lines
        gsap.utils.toArray('.section-line').forEach(function(line) {
            gsap.fromTo(line,
                { width: 0 },
                {
                    width: 60,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Hero parallax on scroll
        gsap.to('.hero-content', {
            y: 100,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Timeline line draw
        var timelineLine = document.getElementById('timelineLine');
        if (timelineLine) {
            // Create a pseudo-element animation by animating a CSS custom property
            gsap.fromTo(timelineLine,
                { '--line-height': '0%' },
                {
                    '--line-height': '100%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.timeline',
                        start: 'top 60%',
                        end: 'bottom 40%',
                        scrub: 1
                    }
                }
            );
        }
    }

    // ==================== PREFERS REDUCED MOTION ====================
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
        // Make all reveals immediately visible
        document.querySelectorAll('.reveal-up, .reveal-text').forEach(function(el) {
            el.classList.add('revealed');
        });
    }

})();
