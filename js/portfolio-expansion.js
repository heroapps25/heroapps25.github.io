// Portfolio Premium UI JavaScript - Scroll Snap Version

class PortfolioExpansion {
    constructor() {
        if (window.portfolioExpansionInstance) {
            return window.portfolioExpansionInstance;
        }

        this.scrollContainer = document.querySelector('.portfolio-horizontal-scroll');
        this.cards = [];
        this.expandedView = null;
        this.isExpanded = false;
        this.closeTimeout = null;
        this.savedScrollPosition = 0;

        // Auto-scroll properties
        this.autoScrollSpeed = 0.5; // Base absolute speed
        this.scrollDirection = 1; // 1 for right, -1 for left
        this.autoScrollAnimation = null;
        this.isHovering = false;
        this.isPaused = false;
        this.hasAnimated = false;
        this.lastTrackScrollLeft = 0;
        this.trackStalledFrames = 0;

        // Drag scroll properties
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.draggedDistance = 0;

        this.init();
        window.portfolioExpansionInstance = this;
    }

    init() {
        this.createExpandedViewContainer();
        this.refreshCards();
        this.attachGlobalListeners();

        // Initial visual update
        this.updateVisuals();

        // Setup entrance animation
        this.setupEntranceAnimation();

        // Start auto-scroll animation
        this.startAutoScroll();
    }

    refreshCards() {
        this.scrollContainer = document.querySelector('.portfolio-horizontal-scroll');
        this.cards = document.querySelectorAll('.portfolio-card-item');

        // Ensure new cards are interactive if we've already animated
        if (this.hasAnimated) {
            this.cards.forEach(card => {
                if (!card.classList.contains('animate-in')) {
                    card.classList.add('animate-in');
                    card.style.pointerEvents = 'auto';
                }
            });
        }

        // Re-attach click listeners to all cards
        this.cards.forEach(card => {
            // Remove old listener if exists
            card.removeEventListener('click', card._expandHandler);
            card._expandHandler = (e) => {
                // Ignore click if we dragged significantly (jiggle threshold bumped to 10 for easier clicking)
                if (this.draggedDistance > 10) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                this.expandCard(card);
            };
            card.addEventListener('click', card._expandHandler);
        });
    }

    createExpandedViewContainer() {
        if (document.querySelector('.portfolio-expanded-view')) {
            this.expandedView = document.querySelector('.portfolio-expanded-view');
            return;
        }
        const container = document.createElement('div');
        container.className = 'portfolio-expanded-view';
        container.innerHTML = `
            <div class="portfolio-expanded-backdrop"></div>
            <div class="portfolio-expanded-content">
                <button class="portfolio-close-btn" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div class="portfolio-expanded-image-container">
                    <div class="portfolio-expanded-image">
                        <!-- Dynamic content loaded here -->
                    </div>
                    <div class="portfolio-carousel-controls" style="display: none;">
                        <button class="portfolio-carousel-prev"><i class="fas fa-chevron-left"></i></button>
                        <button class="portfolio-carousel-next"><i class="fas fa-chevron-right"></i></button>
                        <div class="portfolio-carousel-dots"></div>
                    </div>
                </div>
                <div class="portfolio-expanded-details">
                    <div class="portfolio-expanded-category"></div>
                    <h2 class="portfolio-expanded-title"></h2>
                    <div class="portfolio-expanded-divider"></div>
                    <p class="portfolio-expanded-description"></p>
                    <div class="portfolio-expanded-tech">
                        <h4>Technologies Used</h4>
                        <div class="portfolio-tech-stack"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        this.expandedView = container;
    }

    attachGlobalListeners() {
        if (!this.scrollContainer) return;

        // Scroll Event for Visuals
        this.scrollContainer.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.updateVisuals());
        });

        // Close listeners
        this.expandedView.querySelector('.portfolio-close-btn').addEventListener('click', () => this.closeCard());
        this.expandedView.querySelector('.portfolio-expanded-backdrop').addEventListener('click', () => this.closeCard());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) this.closeCard();
        });

        // Pause auto-scroll on hover
        this.scrollContainer.addEventListener('mouseenter', () => {
            this.isHovering = true;
        });

        this.scrollContainer.addEventListener('mouseleave', () => {
            this.isHovering = false;
        });

        // Global mouseup to prevent perpetual drag if released outside container
        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.scrollContainer.classList.remove('dragging');
                this.scrollContainer.style.scrollBehavior = 'smooth';
            }
        });

        // Drag to scroll functionality
        this.scrollContainer.addEventListener('mousedown', (e) => {
            // Prevent default to stop browser image ghost-dragging, which ruins custom mouseup detection
            e.preventDefault();
            this.isDragging = true;
            this.scrollContainer.classList.add('dragging');
            this.startX = e.pageX - this.scrollContainer.offsetLeft;
            this.initialX = this.startX; // Save initial X to prevent path-length issues
            this.scrollLeft = this.scrollContainer.scrollLeft;
            this.draggedDistance = 0;

            // Disable smooth scrolling during drag for instant feedback
            this.scrollContainer.style.scrollBehavior = 'auto';
        });

        this.scrollContainer.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.scrollContainer.classList.remove('dragging');

            // Re-enable smooth scrolling
            this.scrollContainer.style.scrollBehavior = 'smooth';
        });

        this.scrollContainer.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();

            const x = e.pageX - this.scrollContainer.offsetLeft;
            const walk = (x - this.startX) * 1.5; // Scroll speed multiplier

            // Store net displacement rather than accumulating path length which punished mouse jiggles
            this.draggedDistance = Math.abs(x - this.initialX);
            this.startX = x; // Reset startX to current so drag is relative to last pos

            // Apply drag
            this.scrollContainer.scrollLeft -= walk;
        });
    }

    updateVisuals() {
        // Visual effects removed as per user request
    }

    expandCard(card) {
        if (this.isExpanded) return;

        // Clear any pending close timeout to prevent flicker
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }

        this.isExpanded = true;
        this.savedScrollPosition = window.scrollY;

        const rect = card.getBoundingClientRect();
        const content = this.expandedView.querySelector('.portfolio-expanded-content');

        // Set initial position of expanded content to match card
        content.style.top = `${rect.top}px`;
        content.style.left = `${rect.left}px`;
        content.style.width = `${rect.width}px`;
        content.style.height = `${rect.height}px`;
        content.style.borderRadius = '1.5rem';

        // Populate data
        // Use hover image if available, otherwise fall back to default card image
        const hoverImage = card.querySelector('.card-image-hover');
        const image = hoverImage ? hoverImage.src : card.querySelector('.card-image').src;
        const category = card.querySelector('.card-category').textContent;
        const title = card.querySelector('.card-title').textContent;
        const description = card.dataset.description;
        const techStack = card.dataset.techStack ? card.dataset.techStack.split(',') : [];
        const projectUrl = card.querySelector('a')?.href || '#';

        // Helper to get relative path for comparison
        const getRelativePath = (url) => {
            if (!url) return '';
            const parts = url.split('/');
            return parts.slice(-3).join('/'); // Get last 3 parts: assets/img/portfolio/item.jpg
        };

        // Setup Carousel
        let gallery = [];
        if (card.dataset.gallery) {
            try {
                gallery = JSON.parse(card.dataset.gallery.replace(/&apos;/g, "'"));
            } catch (e) { }
        }

        const imgContainer = this.expandedView.querySelector('.portfolio-expanded-image');
        const controls = this.expandedView.querySelector('.portfolio-carousel-controls');
        const dotsContainer = this.expandedView.querySelector('.portfolio-carousel-dots');

        // Helper function to create generic slide element (image or video)
        const createSlideElement = (src, isFirst = false) => {
            const isVideo = src.match(/\.(mp4|webm|mov)$/i);
            const el = document.createElement(isVideo ? 'video' : 'img');
            el.src = src;
            el.className = `portfolio-slide ${isFirst ? 'active' : ''}`;
            if (isVideo) {
                // Removing controls entirely to act like a GIF
                el.muted = true;
                el.defaultMuted = true;
                el.setAttribute('muted', '');
                el.autoplay = true;
                el.loop = false; // So we can catch the 'ended' event
                el.playsInline = true;
                el.setAttribute('preload', 'metadata');

                // Keep controls for play/pause but hide volume via CSS-like trick (some browsers support this)
                el.controls = false;
            } else {
                el.alt = title;
            }
            return el;
        };

        // Reset container and set first image
        imgContainer.innerHTML = '';
        const mainEl = createSlideElement(image, true);

        // Add fullscreen capability to single images too
        mainEl.onclick = (e) => {
            e.stopPropagation();
            if (mainEl.requestFullscreen) mainEl.requestFullscreen();
            else if (mainEl.webkitRequestFullscreen) mainEl.webkitRequestFullscreen();
            else if (mainEl.msRequestFullscreen) mainEl.msRequestFullscreen();
        };

        imgContainer.appendChild(mainEl);

        if (gallery.length > 0) {
            controls.style.display = 'flex';

            // Ensure main image is first in gallery if not already included
            const mainRelPath = getRelativePath(image);
            const galleryRelPaths = gallery.map(src => getRelativePath(src));

            if (!galleryRelPaths.includes(mainRelPath)) {
                gallery.unshift(image);
            }

            // Add other media to DOM
            gallery.forEach((mediaSrc, i) => {
                if (i > 0) { // First media is already added
                    const mediaEl = createSlideElement(mediaSrc, false);
                    imgContainer.appendChild(mediaEl);
                }
            });

            // Generate dots
            dotsContainer.innerHTML = gallery.map((_, i) => `<div class="portfolio-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('');

            this.currentSlide = 0;
            this.galleryLength = gallery.length;
            this.goToSlide(0); // Initialize classes

            // Make slides clickable for prev/next and fullscreen zoom
            imgContainer.querySelectorAll('.portfolio-slide').forEach((slide, i) => {
                slide.onclick = (e) => {
                    e.stopPropagation();
                    if (slide.classList.contains('prev')) {
                        this.goToSlide(this.currentSlide - 1);
                    } else if (slide.classList.contains('next')) {
                        this.goToSlide(this.currentSlide + 1);
                    } else if (slide.classList.contains('active')) {
                        // Zoom / Fullscreen when clicking the active image/video
                        if (slide.requestFullscreen) {
                            slide.requestFullscreen();
                        } else if (slide.webkitRequestFullscreen) {
                            slide.webkitRequestFullscreen(); // Safari
                        } else if (slide.msRequestFullscreen) {
                            slide.msRequestFullscreen(); // IE11
                        }
                    }
                };
            });

            // Event listeners
            const nextBtn = controls.querySelector('.portfolio-carousel-next');
            const prevBtn = controls.querySelector('.portfolio-carousel-prev');

            nextBtn.onclick = (e) => { e.stopPropagation(); this.goToSlide(this.currentSlide + 1, 1); };
            prevBtn.onclick = (e) => { e.stopPropagation(); this.goToSlide(this.currentSlide - 1, -1); };

            dotsContainer.querySelectorAll('.portfolio-dot').forEach(dot => {
                dot.onclick = (e) => {
                    e.stopPropagation();
                    const targetIndex = parseInt(e.currentTarget.dataset.index);
                    const direction = targetIndex > this.currentSlide ? 1 : -1;
                    this.goToSlide(targetIndex, direction);
                };
            });

            // Auto-play feature
            this.startCarouselAutoPlay();

            // Pause auto-play on hover
            imgContainer.onmouseenter = () => this.stopCarouselAutoPlay();
            imgContainer.onmouseleave = () => this.startCarouselAutoPlay();

        } else {
            controls.style.display = 'none';
        }

        this.expandedView.querySelector('.portfolio-expanded-category').textContent = category;
        this.expandedView.querySelector('.portfolio-expanded-title').textContent = title;
        this.expandedView.querySelector('.portfolio-expanded-description').innerHTML = description;
        this.expandedView.dataset.projectUrl = projectUrl;

        const techContainer = this.expandedView.querySelector('.portfolio-tech-stack');
        techContainer.innerHTML = '';
        techStack.forEach(tech => {
            const span = document.createElement('span');
            span.className = 'portfolio-tech-badge';
            span.textContent = tech.trim();
            techContainer.appendChild(span);
        });

        // Show view and restore pointer events
        this.expandedView.style.display = 'flex';
        this.expandedView.style.pointerEvents = 'auto';

        // Trigger transition
        requestAnimationFrame(() => {
            this.expandedView.classList.add('active');
            content.classList.add('full');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        });
    }

    closeCard() {
        if (!this.isExpanded) return;

        // Set to false immediately to allow clicking another card right away
        this.isExpanded = false;

        // Disable pointer events immediately so users can hover other cards
        this.expandedView.style.pointerEvents = 'none';
        this.stopCarouselAutoPlay();

        const content = this.expandedView.querySelector('.portfolio-expanded-content');

        // Find the original card to get its current position
        const title = this.expandedView.querySelector('.portfolio-expanded-title').textContent;
        let originalCard = null;
        this.cards.forEach(card => {
            if (card.querySelector('.card-title').textContent === title) {
                originalCard = card;
            }
        });

        if (originalCard) {
            const rect = originalCard.getBoundingClientRect();
            content.classList.remove('full');
            content.style.top = `${rect.top}px`;
            content.style.left = `${rect.left}px`;
            content.style.width = `${rect.width}px`;
            content.style.height = `${rect.height}px`;
            content.style.borderRadius = '1.5rem';
        }

        this.expandedView.classList.remove('active');

        // Store the timeout ID so it can be cleared if needed
        this.closeTimeout = setTimeout(() => {
            this.expandedView.style.display = 'none';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            window.scrollTo(0, this.savedScrollPosition);
            this.closeTimeout = null;
        }, 800);
    }

    setupEntranceAnimation() {
        let hasAnimated = false;
        let previousY = 0;
        let previousRatio = 0;

        // Use Intersection Observer to trigger animation when section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const currentY = entry.boundingClientRect.y;
                const currentRatio = entry.intersectionRatio;
                const isScrollingDown = currentY < previousY;

                if (entry.isIntersecting && currentRatio > previousRatio) {
                    // Only animate when scrolling down and hasn't animated yet
                    if (isScrollingDown && !hasAnimated) {
                        // Animate the heading first
                        const container = entry.target.querySelector('.container');
                        if (container) {
                            container.classList.add('animate-in');
                        }

                        // Then trigger animation for all cards with a slight delay
                        setTimeout(() => {
                            this.cards.forEach((card, index) => {
                                setTimeout(() => {
                                    card.classList.add('animate-in');

                                    // Enable hover after animation completes
                                    const enableHover = (e) => {
                                        if (e.propertyName === 'opacity') {
                                            card.style.pointerEvents = 'auto';
                                            card.removeEventListener('transitionend', enableHover);
                                        }
                                    };
                                    card.addEventListener('transitionend', enableHover);

                                    // Fallback timeout in case the CSS opacity transition doesn't fire or drops
                                    setTimeout(() => {
                                        card.style.pointerEvents = 'auto';
                                    }, 800);
                                }, index * 50); // Small delay between each card for wave effect
                            });
                        }, 200); // Reduced delay for faster response

                        hasAnimated = true;
                        this.hasAnimated = true;
                    } else if (!isScrollingDown && hasAnimated) {
                        // When scrolling up from below, keep everything visible
                        const container = entry.target.querySelector('.container');
                        if (container && !container.classList.contains('animate-in')) {
                            container.classList.add('animate-in');
                        }

                        this.cards.forEach((card) => {
                            if (!card.classList.contains('animate-in')) {
                                card.classList.add('animate-in');
                            }
                            // Enable hover immediately when scrolling up
                            card.style.pointerEvents = 'auto';
                        });
                    }
                } else if (!entry.isIntersecting && currentRatio < previousRatio) {
                    // Only reset when scrolling up past the section (going above it)
                    const isScrollingUp = currentY > previousY;

                    if (isScrollingUp) {
                        const container = entry.target.querySelector('.container');
                        if (container) {
                            container.classList.remove('animate-in');
                        }

                        this.cards.forEach((card) => {
                            card.classList.remove('animate-in');
                            // Disable hover again for next animation
                            card.style.pointerEvents = 'none';
                        });

                        hasAnimated = false;
                    }
                }

                previousY = currentY;
                previousRatio = currentRatio;
            });
        }, {
            threshold: [0, 0.05, 0.1], // Lower thresholds for earlier detection
            rootMargin: '100px 0px 0px 0px' // Trigger 100px before section enters viewport
        });

        // Observe the portfolio section
        const portfolioSection = document.querySelector('#portfolio');
        if (portfolioSection) {
            observer.observe(portfolioSection);
        }
    }

    goToSlide(index, requestedDirection = null) {
        if (this.galleryLength <= 0) return;

        let comingFromRight = true;

        if (index < 0) {
            index = this.galleryLength - 1;
            comingFromRight = false;
        } else if (index >= this.galleryLength) {
            index = 0;
            comingFromRight = true;
        } else if (requestedDirection !== null) {
            comingFromRight = requestedDirection > 0;
        } else {
            comingFromRight = index > this.currentSlide;
        }

        this.currentSlide = index;

        // Reset auto-play timer when navigating manually so it doesn't double-animate
        if (this.carouselInterval) {
            this.startCarouselAutoPlay();
        }

        const slides = this.expandedView.querySelectorAll('.portfolio-slide');
        const dots = this.expandedView.querySelectorAll('.portfolio-dot');

        let isVideoActive = false; // Flag to check if current slide is a video

        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev', 'next');

            // Manage video playback state
            if (slide.tagName.toLowerCase() === 'video') {
                slide.pause();
                slide.currentTime = 0; // Reset video to beginning when slide changes
            }

            if (i === index) {
                slide.classList.add('active');
                if (slide.tagName.toLowerCase() === 'video') {
                    isVideoActive = true;
                    slide.muted = true; // Enforce mute on play
                    slide.loop = false; // Ensure it stops at the end to trigger 'ended'

                    // Play the video and stop auto-play so user can watch it
                    slide.play().catch(e => console.error("Video play failed:", e));
                    this.stopCarouselAutoPlay();

                    // Move to the next slide when the video finishes
                    slide.onended = () => {
                        if (this.isExpanded && this.galleryLength > 1) {
                            this.goToSlide(this.currentSlide + 1);
                        }
                    };
                }
            } else if (this.galleryLength > 2) {
                if (i === (index - 1 + this.galleryLength) % this.galleryLength) {
                    slide.classList.add('prev');
                } else if (i === (index + 1) % this.galleryLength) {
                    slide.classList.add('next');
                }
            } else if (this.galleryLength === 2) {
                if (i !== index) {
                    if (comingFromRight) slide.classList.add('next');
                    else slide.classList.add('prev');
                }
            }
        });

        dots.forEach((dot, i) => {
            if (i === index) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        // Restart autoplay if we transitioned to an image and not hovering
        if (!isVideoActive && this.galleryLength > 1) {
            this.startCarouselAutoPlay();
        }
    }

    startAutoScroll() {
        // Minimum overflow required to start auto-scrolling
        const MIN_OVERFLOW_THRESHOLD = 1;

        // Force disable snap and smooth behavior for programmatic scroll
        if (this.scrollContainer) {
            this.scrollContainer.style.setProperty('scroll-snap-type', 'none', 'important');
            this.scrollContainer.style.setProperty('scroll-behavior', 'auto', 'important');
        }

        const scroll = () => {
            if (!this.isHovering && !this.isExpanded && !this.isDragging && this.scrollContainer) {
                const currentScroll = this.scrollContainer.scrollLeft;
                const maxScroll = Math.max(0, this.scrollContainer.scrollWidth - this.scrollContainer.clientWidth);

                if (maxScroll > MIN_OVERFLOW_THRESHOLD) {
                    // Use a slightly faster speed (1.0) for reliable pixel crossing
                    const speed = 1.0;
                    this.scrollContainer.scrollLeft += (speed * this.scrollDirection);

                    // Wall Detection: If we didn't move after scrolling, flip direction
                    if (Math.abs(this.scrollContainer.scrollLeft - this.lastTrackScrollLeft) < 0.1) {
                        this.trackStalledFrames++;
                        if (this.trackStalledFrames > 2) { // Fast flip
                            this.scrollDirection *= -1;
                            this.trackStalledFrames = 0;
                        }
                    } else {
                        this.trackStalledFrames = 0;
                    }
                    this.lastTrackScrollLeft = this.scrollContainer.scrollLeft;
                } else {
                    // Reset to start if no overflow
                    if (currentScroll > 0) {
                        this.scrollContainer.scrollLeft -= 1.0;
                    }
                }
            }

            this.autoScrollAnimation = requestAnimationFrame(scroll);
        };

        this.autoScrollAnimation = requestAnimationFrame(scroll);
    }

    stopAutoScroll() {
        if (this.autoScrollAnimation) {
            cancelAnimationFrame(this.autoScrollAnimation);
            this.autoScrollAnimation = null;
        }
    }

    startCarouselAutoPlay() {
        this.stopCarouselAutoPlay();
        if (this.galleryLength > 1) {
            this.carouselInterval = setInterval(() => {
                this.goToSlide(this.currentSlide + 1);
            }, 3000); // 3 seconds per slide
        }
    }

    stopCarouselAutoPlay() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
            this.carouselInterval = null;
        }
    }
}

// Initialize or Refresh Portfolio
const initPortfolio = () => {
    if (document.querySelector('.portfolio-horizontal-scroll')) {
        if (!window.portfolioExpansionInstance) {
            window.portfolioExpansionInstance = new PortfolioExpansion();
        } else {
            window.portfolioExpansionInstance.refreshCards();
        }
    }
};

// Export the function globally for content-loader.js
window.initializePortfolioExpansion = initPortfolio;

// Listen for the custom event from pages.js
document.addEventListener('sectionsLoaded', initPortfolio);

// Also try on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initPortfolio);

