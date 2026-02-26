/**
 * Number Counter Animation
 * Animates numbers counting up from 0 to their target value
 */

class CountUp {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.suffix = element.dataset.suffix || '';
        this.hasAnimated = false;
    }

    animate() {
        if (this.hasAnimated) return;

        const startTime = performance.now();
        const startValue = 0;

        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);

            // Easing function for smooth animation (easeOutExpo)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentValue = Math.floor(startValue + (this.target - startValue) * easeProgress);
            this.element.textContent = currentValue + this.suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                this.element.textContent = this.target + this.suffix;
                this.hasAnimated = true;
            }
        };

        requestAnimationFrame(updateCount);
    }

    reset() {
        this.hasAnimated = false;
        this.element.textContent = '0' + this.suffix;
    }
}

// Global counters array
let counters = [];
let observer = null;

// Initialize counter animations
function initializeCounters() {
    const counterElements = document.querySelectorAll('[data-count]');

    if (counterElements.length === 0) {
        return;
    }

    // Clear existing counters
    counters = [];

    // Disconnect existing observer
    if (observer) {
        observer.disconnect();
    }

    counterElements.forEach(element => {
        const target = parseInt(element.dataset.count);
        const duration = parseInt(element.dataset.duration) || 2000;
        const counter = new CountUp(element, target, duration);
        counters.push({ element, counter });

        // Set initial value
        element.textContent = '0' + counter.suffix;
    });

    // Use Intersection Observer to trigger animations when elements come into view
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const counterData = counters.find(c => c.element === entry.target);
            if (!counterData) return;

            if (entry.isIntersecting) {
                // Reset and animate when coming into view
                counterData.counter.hasAnimated = false;
                setTimeout(() => {
                    counterData.counter.animate();
                }, 100);
            } else {
                // Reset to 0 when scrolling away
                counterData.counter.hasAnimated = false;
                counterData.counter.element.textContent = '0' + counterData.counter.suffix;
            }
        });
    }, {
        threshold: 0.3, // Trigger when 30% of element is visible
        rootMargin: '0px'
    });

    // Observe all counter elements
    counterElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Try to initialize immediately
    initializeCounters();

    // Also try after delays to catch dynamically loaded content
    setTimeout(initializeCounters, 500);
    setTimeout(initializeCounters, 1500);
});

// Re-initialize when all sections are loaded (emitted by pages.js)
document.addEventListener('sectionsLoaded', () => {
    // Small delay to ensure DOM is painted
    setTimeout(initializeCounters, 100);
});

// Watch for dynamic content changes (debounced to prevent excessive calls)
let initTimeout = null;
const contentObserver = new MutationObserver(() => {
    // Debounce the initialization to prevent excessive calls
    if (initTimeout) {
        clearTimeout(initTimeout);
    }
    initTimeout = setTimeout(() => {
        const counterElements = document.querySelectorAll('[data-count]');
        // Only reinitialize if we found new counter elements
        if (counterElements.length > counters.length) {
            initializeCounters();
        }
    }, 200);
});

// Start observing after initial load
setTimeout(() => {
    if (document.body) {
        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}, 2000); // Wait 2 seconds before starting to observe
