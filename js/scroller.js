(function () {
    // Global variables for tracking the active dragged scroller
    let activeScroller = null;
    let isGlobalDown = false;
    let globalStartX;
    let globalScrollLeft;
    let isGlobalDragging = false;

    function initScroller(scroller) {
        if (scroller.dataset.initialized) return;
        scroller.dataset.initialized = "true";

        let localDirection = 1;
        let localIsPaused = false;
        const localScrollSpeed = 1.0; // Faster for reliable pixel crossing
        let lastScrollLeft = scroller.scrollLeft;
        let stalledFrames = 0;

        // Force disable snap and smooth behavior for programmatic scroll
        scroller.style.setProperty('scroll-snap-type', 'none', 'important');
        scroller.style.setProperty('scroll-behavior', 'auto', 'important');

        function step() {
            if (!localIsPaused && !isGlobalDown) {
                // Determine if there is actual overflow
                const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);

                if (maxScroll > 2) {
                    scroller.scrollLeft += localScrollSpeed * localDirection;

                    // Wall Detection: If we didn't move after scrolling, flip direction
                    // We allow a few frames of 'stalling' to account for fractional rendering
                    if (Math.abs(scroller.scrollLeft - lastScrollLeft) < 0.1) {
                        stalledFrames++;
                        if (stalledFrames > 2) { // More aggressive flip
                            localDirection *= -1;
                            stalledFrames = 0;
                        }
                    } else {
                        stalledFrames = 0;
                    }
                    lastScrollLeft = scroller.scrollLeft;
                }
            }
            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);

        scroller.addEventListener('mouseenter', () => localIsPaused = true);
        scroller.addEventListener('mouseleave', () => {
            localIsPaused = false;
            lastScrollLeft = scroller.scrollLeft; // Reset to avoid immediate flip
        });
    }

    function scanAndInit() {
        const scrollers = document.querySelectorAll('.portfolio-scroller');
        scrollers.forEach(initScroller);
    }

    // Initialize immediately and on custom event
    scanAndInit();
    document.addEventListener('sectionsLoaded', scanAndInit);

    document.addEventListener('mousedown', (e) => {
        const scroller = e.target.closest('.portfolio-scroller');
        if (!scroller) return;

        isGlobalDown = true;
        activeScroller = scroller;
        scroller.classList.add('active');
        globalStartX = e.pageX - scroller.offsetLeft;
        globalScrollLeft = scroller.scrollLeft;
        isGlobalDragging = false;
        scroller.style.scrollBehavior = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (!isGlobalDown) return;
        isGlobalDown = false;
        if (activeScroller) {
            activeScroller.classList.remove('active');
            activeScroller.style.scrollBehavior = 'auto'; // Keep auto
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isGlobalDown || !activeScroller) return;

        const x = e.pageX - activeScroller.offsetLeft;
        const walk = (x - globalStartX) * 1.5;

        if (Math.abs(walk) > 5) {
            isGlobalDragging = true;
        }

        if (isGlobalDragging) {
            e.preventDefault();
            activeScroller.scrollLeft = globalScrollLeft - walk;
        }
    });

    // Prevent clicks on portfolio items if we were dragging
    document.addEventListener('click', (e) => {
        if (isGlobalDragging) {
            const scroller = e.target.closest('.portfolio-scroller');
            if (scroller) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
            isGlobalDragging = false;
        }
    }, true);
})();
