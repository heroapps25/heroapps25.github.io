(function () {
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;
    let activeScroller = null;
    let animationId = null;
    let isPaused = false;
    let direction = 1; // 1 for right, -1 for left
    const scrollSpeed = 0.1; // Pixels per frame

    function initScroller(scroller) {
        if (scroller.dataset.initialized) return;
        scroller.dataset.initialized = "true";

        // Disable scroll snap for smooth auto-scroll
        scroller.style.scrollSnapType = 'none';

        function step() {
            if (!isPaused && !isDown) {
                scroller.scrollLeft += scrollSpeed * direction;

                const maxScroll = scroller.scrollWidth - scroller.clientWidth;

                if (scroller.scrollLeft >= maxScroll - 1) {
                    direction = -1;
                } else if (scroller.scrollLeft <= 1) {
                    direction = 1;
                }
            }
            animationId = requestAnimationFrame(step);
        }

        animationId = requestAnimationFrame(step);

        scroller.addEventListener('mouseenter', () => isPaused = true);
        scroller.addEventListener('mouseleave', () => {
            if (!isDown) isPaused = false;
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

        isDown = true;
        isPaused = true;
        activeScroller = scroller;
        scroller.classList.add('active');
        startX = e.pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
        isDragging = false;
    });

    document.addEventListener('mouseleave', () => {
        if (!isDown) return;
        isDown = false;
        isPaused = false;
        if (activeScroller) {
            activeScroller.classList.remove('active');
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDown) return;
        isDown = false;
        isPaused = false;
        if (activeScroller) {
            activeScroller.classList.remove('active');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDown || !activeScroller) return;

        const x = e.pageX - activeScroller.offsetLeft;
        const walk = (x - startX) * 0.1; // Scroll speed

        if (Math.abs(walk) > 0.1) {
            isDragging = true;
        }

        if (isDragging) {
            e.preventDefault();
            activeScroller.scrollLeft = scrollLeft - walk;
        }
    });

    // Prevent clicks on portfolio items if we were dragging
    document.addEventListener('click', (e) => {
        if (isDragging) {
            const scroller = e.target.closest('.portfolio-scroller');
            if (scroller) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
            isDragging = false;
        }
    }, true);
})();
