document.addEventListener('DOMContentLoaded', () => {
    const pageFiles = [
        { file: 'header.html', containerId: 'header-container' },
        { file: 'masthead.html', containerId: 'masthead-container' },
        { file: 'trusted-by.html', containerId: 'trusted-by-container' },
        { file: 'about.html', containerId: 'about-container' },
        { file: 'experience.html', containerId: 'process-container' },
        { file: 'skills.html', containerId: 'expertise-container' },
        { file: 'portfolio.html', containerId: 'portfolio-container' },
        { file: 'contact.html', containerId: 'contact-container' },
        { file: 'footer.html', containerId: 'footer-container' }
    ];

    const loadPromises = pageFiles.map(({ file, containerId }) => {
        return fetch(`page/${file}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load page section: ${file}`);
                }
                return response.text();
            })
            .then(html => {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Error loading page section:', error);
            });
    });

    Promise.all(loadPromises).then(() => {
        // Initialize content loader to populate sections from JSON
        if (window.contentLoader) {
            contentLoader.initAll().then(() => {
                // Dispatch custom event when all sections are loaded and populated
                document.dispatchEvent(new CustomEvent('sectionsLoaded'));
            });
        } else {
            // Fallback if content loader is not available
            document.dispatchEvent(new CustomEvent('sectionsLoaded'));
        }
    });
});
