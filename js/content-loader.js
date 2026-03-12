const ContentLoader = {
    async initAll() {
        await Promise.all([
            this.loadHeader(),
            this.loadMasthead(),
            this.loadTrustedBy(),
            this.loadAbout(),
            this.loadTeam(),
            this.loadPortfolio(),
            this.loadSkills(),
            this.loadExperience(),
            this.loadContact()
        ]);
    },

    async fetchJSON(filename) {
        try {
            // Add cache busting
            const timestamp = new Date().getTime();
            const response = await fetch(`content/${filename}?v=${timestamp}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    setHTML(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    },

    setAttr(id, attr, value) {
        const el = document.getElementById(id);
        if (el) el.setAttribute(attr, value);
    },

    async loadHeader() {
        const data = await this.fetchJSON('header.json');
        if (!data) return;

        // Logo
        const logoEl = document.getElementById('nav-logo');
        if (logoEl && data.logo) {
            logoEl.innerHTML = `${data.logo.text}<span class="text-primary-600">${data.logo.highlight}</span>`;
        }

        // Nav links + CTA
        const navLinksEl = document.getElementById('nav-links');
        if (navLinksEl) {
            const linksHTML = (data.navLinks || []).map(link => `
                <li class="nav-item mx-0 mx-lg-2">
                    <a class="nav-link py-2 px-0 px-lg-3 text-slate-300 fw-medium" href="${link.href}">${link.label}</a>
                </li>`).join('');

            const ctaHTML = data.cta ? `
                <li class="nav-item ms-lg-3">
                    <a class="btn btn-professional btn-professional-primary px-4" href="${data.cta.href}">${data.cta.text}</a>
                </li>` : '';

            navLinksEl.innerHTML = linksHTML + ctaHTML;
        }
    },

    async loadMasthead() {
        const data = await this.fetchJSON('masthead.json');
        if (!data) return;

        this.setText('masthead-badge', data.badge);

        // Title with highlight
        const titleEl = document.getElementById('masthead-title');
        if (titleEl) {
            titleEl.innerHTML = `${data.title.main}<span class="text-gradient">${data.title.highlight}</span>`;
        }

        this.setText('masthead-description', data.description);

        // Buttons
        const buttonsContainer = document.getElementById('masthead-buttons');
        if (buttonsContainer && data.buttons) {
            buttonsContainer.innerHTML = data.buttons.map(btn => {
                const isPrimary = btn.style === 'primary';
                const btnClass = isPrimary
                    ? 'btn btn-professional btn-professional-primary btn-lg'
                    : 'btn btn-professional btn-professional-outline btn-lg text-white border-white';
                const icon = btn.icon ? `<i class="${btn.icon} ms-2"></i>` : '';
                return `<a class="${btnClass}" href="${btn.link}">${btn.text}${icon}</a>`;
            }).join('');
        }


        // Profile Image
        const profileImg = document.getElementById('masthead-profile-img');
        if (profileImg) {
            profileImg.src = data.profileImage;
            profileImg.alt = data.profileAlt;

            // SVG logos need contain instead of cover, and a transparent background
            if (data.profileImage && data.profileImage.toLowerCase().endsWith('.svg')) {
                profileImg.style.objectFit = 'contain';
                profileImg.style.padding = '2rem';
                profileImg.style.background = 'transparent';
                profileImg.style.width = '100%';
                profileImg.style.height = '100%';
                profileImg.style.minHeight = '320px';
                // Remove the photo-frame border from wrapper for logos
                const wrapper = profileImg.closest('.hero-image-wrapper');
                if (wrapper) {
                    wrapper.style.background = 'transparent';
                    wrapper.style.border = 'none';
                    wrapper.style.boxShadow = 'none';
                    wrapper.classList.remove('overflow-hidden');
                }
            }
        }

        // Stats
        // Top Left Stat
        const stat1 = data.stats.find(s => s.position === 'top-left');
        if (stat1) {
            this.setText('stat-tl-value', stat1.value + stat1.suffix);
            this.setText('stat-tl-label', stat1.label);
            const el = document.getElementById('stat-tl-value');
            if (el) {
                el.setAttribute('data-count', stat1.value);
                el.setAttribute('data-suffix', stat1.suffix);
            }
        }

        // Bottom Right Stat
        const stat2 = data.stats.find(s => s.position === 'bottom-right');
        if (stat2) {
            this.setText('stat-br-value', stat2.value + stat2.suffix);
            this.setText('stat-br-label', stat2.label);
            const el = document.getElementById('stat-br-value');
            if (el) {
                el.setAttribute('data-count', stat2.value);
                el.setAttribute('data-suffix', stat2.suffix);
            }
        }
    },

    async loadTrustedBy() {
        const data = await this.fetchJSON('trusted-by.json');
        const section = document.getElementById('trusted');
        const container = document.getElementById('trusted-logos-container');

        if (!data || !data.companies || data.companies.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        this.setText('trusted-section-label', data.label);

        if (container) {
            container.innerHTML = data.companies.map(company => {
                const slug = company.name.toLowerCase().replace(/\s+/g, '-');
                return `
                    <div class="trusted-logo-item logo-${slug}" title="${company.name}">
                        <img src="${company.logo}" alt="${company.name}" class="trusted-logo-img" />
                    </div>
                `;
            }).join('');

            // Setup pingpong scroll effect based on overflow
            const wrapper = container.parentElement;
            wrapper.classList.add('trusted-logos-wrapper');

            const updatePingPong = () => {
                const parentWidth = wrapper.offsetWidth;
                const scrollWidth = container.scrollWidth;

                // Only animate if the logos are wider than the container
                if (scrollWidth > parentWidth) {
                    container.classList.add('pingpong-animate');
                    container.style.margin = '0';
                    container.style.setProperty('--parent-width', `${parentWidth}px`);

                    // Adjust animation duration based on overflow distance for consistent speed
                    const distance = scrollWidth - parentWidth;
                    const duration = Math.max(15, distance / 40); // Base duration, max speed 40px/s
                    container.style.animationDuration = `${duration}s`;
                } else {
                    container.classList.remove('pingpong-animate');
                    container.style.margin = '0 auto';
                    container.style.transform = 'none';
                }
            };

            // Wait for images to load before computing widths
            setTimeout(updatePingPong, 500);
            window.addEventListener('resize', updatePingPong);
        }
    },

    async loadAbout() {
        const data = await this.fetchJSON('about.json');
        if (!data) return;

        this.setText('about-heading', data.heading);
        this.setText('about-description', data.description);

        const highlightsContainer = document.getElementById('about-highlights');
        if (highlightsContainer && data.highlights) {
            highlightsContainer.innerHTML = data.highlights.map(item => `
                <li class="mb-3 d-flex align-items-center">
                    <i class="fas fa-check-circle text-primary-600 me-3"></i>
                    <span class="text-slate-300 fw-medium">${item}</span>
                </li>
            `).join('');
        }

        // Check if there are stats in about.json that need to be mapped.
        // The current HTML has static stats which seem to duplicate masthead stats but in a different layout.
        // Mapping them based on index if available
        if (data.stats && data.stats.length >= 2) {
            const stat1 = data.stats[0];
            this.setText('about-stat-1-value', stat1.value + stat1.suffix);
            this.setText('about-stat-1-label', stat1.label);
            const el1 = document.getElementById('about-stat-1-value');
            if (el1) {
                el1.setAttribute('data-count', stat1.value);
                el1.setAttribute('data-suffix', stat1.suffix);
            }

            const stat2 = data.stats[1];
            this.setText('about-stat-2-value', stat2.value + stat2.suffix);
            this.setText('about-stat-2-label', stat2.label);
            const el2 = document.getElementById('about-stat-2-value');
            if (el2) {
                el2.setAttribute('data-count', stat2.value);
                el2.setAttribute('data-suffix', stat2.suffix);
            }
        }

        if (data.testimonials && data.testimonials.length > 0) {
            const container = document.getElementById('about-testimonial-container');
            if (container) {
                container.style.display = 'block'; // Ensure it's visible
                if (data.testimonials.length === 1) {
                    // Single testimonial
                    const t = data.testimonials[0];
                    container.innerHTML = `
                        <div class="p-4 bg-slate-800 rounded-4 border border-primary-900/30">
                            <p class="text-slate-300 mb-0 italic">"${t.quote}"</p>
                            <div class="mt-3 small fw-bold text-primary-600">— ${t.author}</div>
                        </div>
                    `;
                } else {
                    // Multiple testimonials - Create Carousel
                    const carouselId = 'aboutTestimonialCarousel';
                    const items = data.testimonials.map((t, index) => `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <div class="p-4 bg-slate-800 rounded-4 border border-primary-900/30">
                                <p class="text-slate-300 mb-0 italic">"${t.quote}"</p>
                                <div class="mt-3 small fw-bold text-primary-600">— ${t.author}</div>
                            </div>
                        </div>
                    `).join('');

                    const indicators = data.testimonials.map((_, index) => `
                        <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" 
                            class="${index === 0 ? 'active' : ''}" aria-current="${index === 0}" aria-label="Slide ${index + 1}"></button>
                    `).join('');

                    container.innerHTML = `
                        <div id="${carouselId}" class="carousel slide carousel-fade testimonial-carousel" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${indicators}
                            </div>
                            <div class="carousel-inner">
                                ${items}
                            </div>
                        </div>
                    `;

                    // Initialize the carousel if Bootstrap is available
                    if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
                        new bootstrap.Carousel(document.getElementById(carouselId), {
                            interval: 5000,
                            ride: 'carousel'
                        });
                    }
                }
            }
        } else if (data.testimonial) {
            // Fallback for legacy format
            const container = document.getElementById('about-testimonial-container');
            if (container) container.style.display = 'block';
            this.setText('about-testimonial-quote', `"${data.testimonial.quote}"`);
            this.setText('about-testimonial-author', `— ${data.testimonial.author}`);
        } else {
            // Empty state
            const container = document.getElementById('about-testimonial-container');
            if (container) {
                container.innerHTML = `
                    <div class="p-4 bg-slate-800/50 rounded-4 border border-slate-700/30 text-center">
                        <i class="fas fa-quote-right text-slate-600 mb-3 opacity-20 fa-2x"></i>
                        <p class="text-slate-500 mb-0 small uppercase tracking-wider">More success stories coming soon</p>
                    </div>
                `;
            }
        }
    },

    async loadTeam() {
        const data = await this.fetchJSON('team.json');
        if (!data) return;

        this.setText('team-heading', data.heading);

        // Load Categories/Filters
        const filtersContainer = document.getElementById('team-filters');
        if (filtersContainer && data.categories) {
            filtersContainer.innerHTML = data.categories.map((category, index) => {
                // Keep the first category active by default, or you can make 'ALL' active
                const isActive = category === 'ALL' ? 'active' : '';
                return `<button class="team-filter-btn ${isActive}" data-filter="${category}">${category}</button>`;
            }).join('');
        }

        // Load Members
        const gridContainer = document.getElementById('team-grid');
        if (gridContainer && data.members) {
            // Group members by name to avoid duplicates in ALL view
            const uniqueMembers = [];
            const memberMap = new Map();

            data.members.forEach(member => {
                if (memberMap.has(member.name)) {
                    const existing = memberMap.get(member.name);
                    if (!existing.roles.includes(member.role)) {
                        existing.roles.push(member.role);
                    }
                    if (!existing.categories.includes(member.category)) {
                        existing.categories.push(member.category);
                    }
                } else {
                    const newMem = { ...member, roles: [member.role], categories: [member.category] };
                    memberMap.set(member.name, newMem);
                    uniqueMembers.push(newMem);
                }
            });

            gridContainer.innerHTML = uniqueMembers.map(member => `
                <div class="col-sm-6 col-md-4 col-lg-3 team-card show" data-categories="${member.categories.join(',')}">
                    <div class="team-card-image-wrapper">
                        <div class="team-card-image-inner">
                            <img src="${member.image}" alt="${member.name}" class="team-card-image" />
                        </div>
                    </div>
                    <h3 class="team-card-name">${member.name}</h3>
                    <span class="team-card-role">${member.roles.join(' • ')}</span>
                </div>
            `).join('');

            // Add filter functionality
            const filterBtns = document.querySelectorAll('.team-filter-btn');
            const teamCards = document.querySelectorAll('.team-card');

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active to clicked
                    btn.classList.add('active');

                    const filterValue = btn.getAttribute('data-filter');

                    teamCards.forEach(card => {
                        card.classList.remove('show');

                        // Use a timeout to allow the exit animation if we add one, or just hide
                        setTimeout(() => {
                            const cardCategories = card.getAttribute('data-categories').split(',');
                            if (filterValue === 'ALL' || cardCategories.includes(filterValue)) {
                                card.classList.remove('hidden');
                                // Force reflow
                                void card.offsetWidth;
                                card.classList.add('show');
                            } else {
                                card.classList.add('hidden');
                            }
                        }, 50); // slight delay for visual effect
                    });
                });
            });
        }
    },

    async loadPortfolio() {
        const data = await this.fetchJSON('portfolio.json');
        if (!data) return;

        this.setText('portfolio-heading', data.heading);
        this.setText('portfolio-subheading', data.subheading);

        // Load Categories/Filters
        const filtersContainer = document.getElementById('portfolio-filters');
        if (filtersContainer && data.categories) {
            filtersContainer.innerHTML = data.categories.map((category) => {
                const isActive = category === 'ALL' ? 'active' : '';
                return `<button class="team-filter-btn ${isActive}" data-filter="${category}">${category}</button>`;
            }).join('');
        }

        const track = document.getElementById('portfolio-track');
        if (track && data.projects) {
            track.innerHTML = data.projects.map(project => `
                <div class="portfolio-card-item show"
                    data-id="${project.id}"
                    data-service-category="${project.serviceCategory || ''}"
                    data-description="${project.description}"
                    data-tech-stack="${project.techStack}"
                    data-bg-color="${project.bgColor}"
                    data-image-style="${project.imageStyle || 'cover'}"
                    data-gallery='${project.gallery ? JSON.stringify(project.gallery).replace(/'/g, "&apos;") : ""}'>
                    <div class="card-image-wrapper">
                        <img class="card-image" src="${project.cardImage}" alt="${project.title}" /> 
                        <img class="card-image-hover" src="${project.hoverImage}" alt="${project.title} Hover" />
                        <div class="card-overlay">
                            <div class="card-category">${project.category}</div>
                            <h3 class="card-title">${project.title}</h3>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add filter functionality
            const filterBtns = document.querySelectorAll('#portfolio-filters .team-filter-btn');
            const portfolioCards = document.querySelectorAll('.portfolio-card-item');

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all
                    filterBtns.forEach(b => b.classList.remove('active'));
                    // Add active to clicked
                    btn.classList.add('active');

                    const filterValue = btn.getAttribute('data-filter');

                    portfolioCards.forEach(card => {
                        card.classList.remove('show');

                        // Use a timeout to allow the exit animation if we add one, or just hide
                        setTimeout(() => {
                            if (filterValue === 'ALL' || card.getAttribute('data-service-category') === filterValue) {
                                card.style.display = 'block';
                                // Force reflow
                                void card.offsetWidth;
                                card.classList.add('show');
                            } else {
                                card.style.display = 'none';
                            }

                            // Re-calculate drag distances for the horizontal scroll if needed
                            if (window.portfolioExpansionInstance) {
                                window.portfolioExpansionInstance.refreshCards();
                            }
                        }, 50); // slight delay for visual effect
                    });
                });
            });

            // Re-initialize portfolio interactions if needed
            if (window.initializePortfolioExpansion) {
                window.initializePortfolioExpansion();
            }
        }
    },

    async loadSkills() {
        const data = await this.fetchJSON('skills.json');
        const section = document.getElementById('expertise');
        if (!data) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        this.setText('skills-heading', data.heading);
        this.setText('skills-subheading', data.subheading);

        const pillarsContainer = document.getElementById('skills-pillars');
        if (pillarsContainer && data.pillars) {
            pillarsContainer.innerHTML = data.pillars.map((pillar, index) => `
                <div class="col-md-6 col-lg-4 pillar-col">
                    <div class="card h-100 p-4 hover-lift glass-card expertise-pillar-card" data-index="${index}">
                        <div class="d-flex align-items-center column-gap-3 mb-3 title-wrapper">
                            <i class="${pillar.icon} icon-dynamic text-${pillar.iconColor}"></i>
                            <h3 class="fw-bold mb-0 text-white title-dynamic">${pillar.title}</h3>
                        </div>
                        <p class="text-slate-400 mb-0 desc-dynamic">
                            ${pillar.description}
                        </p>
                    </div>
                </div>
            `).join('');
        }

        const layoutWrapper = document.getElementById('skills-layout-wrapper');
        const techContainer = document.getElementById('skills-tech-list');
        const activeTitle = document.getElementById('tech-stack-active-title');

        const renderTechStack = (techs) => {
            if (!techs || techs.length === 0) {
                techContainer.innerHTML = '<p class="text-slate-500 w-100 text-center">No precise technologies listed for this category.</p>';
                return;
            }

            const cardsHTML = techs.map((tech, i) => {
                const name = typeof tech === 'string' ? tech : tech.name;
                const icon = typeof tech === 'object' ? (tech.devicon || tech.icon) : null;
                const color = typeof tech === 'object' ? tech.color : '#4a90e2';
                const url = typeof tech === 'object' && tech.url ? tech.url : null;
                const delay = i * 0.05;

                // Icon badge HTML
                let badgeIconHTML = '';
                if (icon && icon.startsWith('devicon-')) {
                    badgeIconHTML = `<i class="${icon}"></i>`;
                } else if (icon && (icon.startsWith('fas ') || icon.startsWith('far ') || icon.startsWith('fab ') || icon.startsWith('fa-'))) {
                    badgeIconHTML = `<i class="${icon}" style="color:${color};"></i>`;
                } else {
                    badgeIconHTML = `<span style="font-size:1rem;font-weight:800;font-family:monospace;color:${color};">${name.charAt(0).toUpperCase()}</span>`;
                }

                // Badge background — very subtle tint of the brand color
                const badgeBg = typeof tech === 'object' && tech.glowColor
                    ? tech.glowColor.replace(/[\d.]+\)$/, '0.15)')
                    : 'rgba(74,144,226,0.15)';

                return `
                <div class="tech-link-card tech-stack-item-animated" style="animation-delay:${delay}s">
                    <div class="tech-link-card-badge" style="background:${badgeBg};">
                        ${badgeIconHTML}
                    </div>
                    <div class="tech-link-card-info">
                        <span class="tech-link-card-name">${name}</span>
                        ${url ? `<span class="tech-link-card-url">${url}</span>` : ''}
                    </div>
                    <i class="fas fa-chevron-right tech-link-card-chevron"></i>
                </div>`;
            }).join('');

            techContainer.innerHTML = `<div class="tech-link-grid w-100">${cardsHTML}</div>`;
        };

        if (layoutWrapper && pillarsContainer) {
            const pillarCards = pillarsContainer.querySelectorAll('.expertise-pillar-card');

            // Store grid-mode height so we can restore it cleanly during reset
            let storedGridHeight = 0;

            pillarCards.forEach(card => {
                card.addEventListener('click', () => {
                    const index = card.getAttribute('data-index');
                    const pillarData = data.pillars[index];

                    // Lock height to the grid's natural height to prevent page resize/jump
                    if (layoutWrapper.classList.contains('skills-grid-view')) {
                        const h = layoutWrapper.offsetHeight;
                        layoutWrapper.style.height = h + 'px';
                        layoutWrapper.style.minHeight = h + 'px';
                    }

                    // Update active states
                    pillarCards.forEach(c => c.classList.remove('expertise-active'));
                    card.classList.add('expertise-active');

                    // Capture grid height BEFORE switching — used later to prevent jump on reset
                    storedGridHeight = layoutWrapper.offsetHeight;

                    // Switch layout to sidebar view
                    layoutWrapper.style.height = '';
                    layoutWrapper.style.minHeight = '';
                    layoutWrapper.classList.remove('skills-grid-view');
                    layoutWrapper.classList.add('skills-sidebar-view');
                    document.getElementById('skills-left-panel').classList.remove('grid-mode-panel');
                    techContainer.parentElement.classList.remove('grid-mode-panel');

                    // Update title
                    if (activeTitle) activeTitle.textContent = pillarData.title + ' Stack';

                    // Render tech stack
                    renderTechStack(pillarData.techStack);

                    // On mobile: show back button and scroll section into view
                    const mobileBack = document.getElementById('skills-mobile-back');
                    if (window.innerWidth < 992) {
                        if (mobileBack) mobileBack.classList.add('visible');
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Back button — returns to grid view on mobile
            const mobileBack = document.getElementById('skills-mobile-back');
            if (mobileBack) {
                mobileBack.addEventListener('click', () => {
                    layoutWrapper.classList.remove('skills-sidebar-view');
                    layoutWrapper.classList.add('skills-grid-view');
                    document.getElementById('skills-left-panel').classList.add('grid-mode-panel');
                    techContainer.parentElement.classList.add('grid-mode-panel');
                    pillarCards.forEach(c => c.classList.remove('expertise-active'));
                    mobileBack.classList.remove('visible');
                });
            }

            // Revert layout to grid when the expertise section goes out of view
            if (section) {
                const observerOptions = {
                    root: null,
                    rootMargin: '0px', // Fire exactly when it leaves the viewport
                    threshold: 0
                };

                const expertiseObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        // Desktop only — mobile uses the back button
                        if (window.innerWidth < 992) return;

                        if (!entry.isIntersecting && layoutWrapper.classList.contains('skills-sidebar-view')) {
                            const rect = entry.boundingClientRect;
                            const vh = window.innerHeight || document.documentElement.clientHeight;

                            // Determine if section is entirely above or entirely below the viewport
                            // Added small 1px buffer for subpixel rounding issues
                            const isAbove = rect.bottom <= 1;
                            const isBelow = rect.top >= (vh - 1);

                            // Only reset if it is completely out of view (user can't see the change)
                            if (!isAbove && !isBelow) return;

                            requestAnimationFrame(() => {
                                const leftPanel = document.getElementById('skills-left-panel');
                                const rightPanel = techContainer.parentElement;

                                // 1. Disable CSS transitions so the height changes instantly without sliding
                                layoutWrapper.style.transition = 'none';
                                leftPanel.style.transition = 'none';
                                rightPanel.style.transition = 'none';

                                // 2. Measure height before reset
                                const heightBefore = layoutWrapper.offsetHeight;

                                // 3. Snap back to grid layout classes
                                layoutWrapper.classList.remove('skills-sidebar-view');
                                layoutWrapper.classList.add('skills-grid-view');
                                leftPanel.classList.add('grid-mode-panel');
                                rightPanel.classList.add('grid-mode-panel');
                                pillarCards.forEach(c => c.classList.remove('expertise-active'));

                                // 4. Force browser reflow to get the new instant height
                                void layoutWrapper.offsetHeight;
                                const heightAfter = layoutWrapper.offsetHeight;

                                // 5. If section is ABOVE us, the height change would push/pull our current scroll position.
                                // Compensate for it instantly.
                                if (isAbove) {
                                    const delta = heightAfter - heightBefore;
                                    if (delta !== 0) {
                                        window.scrollBy({ top: delta, behavior: 'instant' });
                                    }
                                }

                                // 6. Turn transitions back on in the next frame
                                requestAnimationFrame(() => {
                                    layoutWrapper.style.transition = '';
                                    leftPanel.style.transition = '';
                                    rightPanel.style.transition = '';
                                });
                            });
                        }
                    });
                }, observerOptions);

                expertiseObserver.observe(section);
            }

            // Fix stale inline styles when viewport is resized
            // (JS locks minHeight during transitions; resizing makes it stale)
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    // Always clear any locked height — CSS handles sizing
                    layoutWrapper.style.height = '';
                    layoutWrapper.style.minHeight = '';

                    const isMobile = window.innerWidth < 992;
                    const mobileBack = document.getElementById('skills-mobile-back');
                    const inSidebar = layoutWrapper.classList.contains('skills-sidebar-view');

                    if (inSidebar) {
                        if (isMobile) {
                            // On mobile: back button should be visible
                            if (mobileBack) mobileBack.classList.add('visible');
                        } else {
                            // On desktop: hide back button — sidebar handles nav itself
                            if (mobileBack) mobileBack.classList.remove('visible');
                        }
                    }
                }, 150);
            });
        }
    },

    async loadExperience() {
        const data = await this.fetchJSON('experience.json');
        const section = document.getElementById('process');
        if (!data) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        this.setText('experience-heading', data.heading);
        this.setText('experience-description', data.subheading);

        const container = document.getElementById('experience-steps-container');
        if (container && data.steps) {
            const count = data.steps.length;
            let colClass = 'col-md-6 col-lg-3';

            if (count === 1) colClass = 'col-md-8';
            else if (count === 2) colClass = 'col-sm-6';
            else if (count === 3) colClass = 'col-md-4';
            else if (count === 5) colClass = 'col-md-4'; // 3 on top, 2 centered below
            else if (count >= 6) colClass = 'col-md-4 col-lg-3';

            container.classList.add('justify-content-center');
            container.innerHTML = data.steps.map(step => `
                <div class="${colClass}">
                    <div class="process-step p-4 h-100 border border-slate-700 rounded-3 bg-slate-800">
                        <div class="h2 fw-bold text-${step.color} mb-3">${step.number}</div>
                        <h3 class="h5 fw-bold mb-3">${step.title}</h3>
                        <p class="small text-slate-400 mb-0">
                            ${step.description}
                        </p>
                    </div>
                </div>
            `).join('');
        }
    },

    async loadContact() {
        const data = await this.fetchJSON('contact.json');
        if (!data) return;

        // Contact Section Heading & Description
        if (data.heading) {
            const headingEl = document.getElementById('contact-heading');
            if (headingEl) {
                headingEl.innerHTML = `${data.heading.main}<span class="text-gradient">${data.heading.highlight}</span>`;
            }
        }
        this.setText('contact-description', data.description);

        // Calendar Link
        this.setAttr('contact-calendar-link', 'href', data.calendarLink);

        // Social Links (Contact & Footer)
        if (data.socialLinks) {
            const contactSocials = document.getElementById('contact-socials');
            const footerSocials = document.getElementById('footer-socials');

            const linksHTML = data.socialLinks.map(link => `
                <a href="${link.url}" target="_blank" class="text-slate-500 hover-text-primary-400 fs-4">
                    <i class="${link.icon}"></i>
                </a>
            `).join('');

            const footerLinksHTML = data.socialLinks.map(link => `
                <a class="btn btn-outline-light btn-social mx-1" href="${link.url}" target="_blank">
                    <i class="${link.icon}"></i>
                </a>
            `).join('');

            if (contactSocials) contactSocials.innerHTML = linksHTML;
            if (footerSocials) footerSocials.innerHTML = footerLinksHTML;
        }

        // Branding & Copyright (Footer)
        this.setText('footer-branding-name', data.footerBranding?.name);
        this.setText('footer-branding-highlight', data.footerBranding?.highlight);
        this.setText('footer-branding-desc', data.footerBranding?.description);
        this.setText('footer-copyright', data.footerBranding?.copyright);

        // Footer Nav Links
        const footerNav = document.getElementById('footer-nav-links');
        if (footerNav && data.footerNavLinks) {
            footerNav.innerHTML = data.footerNavLinks.map(link =>
                `<a class="text-slate-400 hover-text-white text-decoration-none small" href="${link.href}">${link.label}</a>`
            ).join('');
        }
    }
};

window.contentLoader = ContentLoader;
