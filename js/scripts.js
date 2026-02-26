/*!
* Start Bootstrap - Freelancer v7.0.7 (https://startbootstrap.com/theme/freelancer)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-freelancer/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    const initScripts = () => {
        // Navbar shrink function
        var navbarShrink = function () {
            const navbarCollapsible = document.body.querySelector('#mainNav');
            if (!navbarCollapsible) {
                return;
            }
            if (window.scrollY === 0) {
                navbarCollapsible.classList.remove('navbar-shrink')
            } else {
                navbarCollapsible.classList.add('navbar-shrink')
            }

        };

        // Shrink the navbar 
        navbarShrink();

        // Shrink the navbar when page is scrolled
        document.addEventListener('scroll', navbarShrink);


        // Collapse responsive navbar when toggler is visible
        const navbarToggler = document.body.querySelector('.navbar-toggler');
        const responsiveNavItems = [].slice.call(
            document.querySelectorAll('#navbarResponsive .nav-link')
        );
        responsiveNavItems.map(function (responsiveNavItem) {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    navbarToggler.click();
                }
            });
        });

        // Close responsive navbar when scrolling
        window.addEventListener('scroll', () => {
            const navbarCollapse = document.querySelector('#navbarResponsive');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        });

        // Close responsive navbar when clicking outside
        document.addEventListener('click', (event) => {
            const navbarCollapse = document.querySelector('#navbarResponsive');
            const navbarToggler = document.querySelector('.navbar-toggler');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                if (!navbarCollapse.contains(event.target) && !navbarToggler.contains(event.target)) {
                    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                }
            }
        });

        // Dynamic Navbar Text Color based on section background
        const sections = document.querySelectorAll('section, header.masthead');
        const mainNavElement = document.querySelector('#mainNav');


        if (mainNavElement && sections.length > 0) {
            const updateNavbarColor = () => {
                const x = window.innerWidth / 2;
                const y = 50;

                // Use elementsFromPoint to get ALL elements at this position
                // This allows us to "see through" the navbar
                const elementsAtPoint = document.elementsFromPoint(x, y);
                if (!elementsAtPoint || elementsAtPoint.length === 0) return;

                // Find the first element that is a section or header (excluding the navbar itself)
                let currentSection = null;
                for (const el of elementsAtPoint) {
                    const section = el.closest('section, header.masthead');
                    if (section && !mainNavElement.contains(section)) {
                        currentSection = section;
                        break;
                    }
                }

                if (currentSection) {
                    const isWhiteSection = !currentSection.classList.contains('bg-slate-900') &&
                        !currentSection.classList.contains('bg-primary') &&
                        !currentSection.classList.contains('bg-primary-1');

                    if (isWhiteSection) {
                        mainNavElement.classList.add('navbar-light-mode');
                    } else {
                        mainNavElement.classList.remove('navbar-light-mode');
                    }
                }
            };

            document.addEventListener('scroll', updateNavbarColor);
            updateNavbarColor();
        }

        // Scroll Reveal Implementation
        const revealOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const revealCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    // Remove visible class when element is below the viewport
                    // This allows the animation to re-trigger when scrolling back down
                    if (entry.boundingClientRect.top > 0) {
                        entry.target.classList.remove('visible');
                    }
                }
            });
        };

        const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

        // Target all elements with reveal classes
        const revealElements = document.querySelectorAll(
            '.reveal-fade-in, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right, .reveal-scale-up, .reveal-staggered, .reveal-premium-up, .reveal-staggered-premium'
        );
        revealElements.forEach(el => {
            revealObserver.observe(el);
        });

        // Lightweight Parallax Effect
        const parallaxElements = document.querySelectorAll('.reveal-parallax');
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                parallaxElements.forEach(el => {
                    const speed = el.dataset.speed || 0.1;
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const yPos = -(scrolled * speed);
                        el.style.transform = `translateY(${yPos}px)`;
                    }
                });
            });
        }

        // Update copyright year
        const yearElement = document.querySelector('#copyright-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    // Wait for sections to be loaded before initializing
    document.addEventListener('sectionsLoaded', initScripts);

});
