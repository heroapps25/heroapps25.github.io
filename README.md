# HeroApps Portfolio Website

The official portfolio website for HeroApps, a specialized Android development studio with 12+ years of experience crafting high-performance, secure, and user-centric mobile applications using Kotlin and Jetpack Compose.

Live site: [heroapps.github.io](https://heroapps.github.io)

---

## Overview

This is a static, single-page portfolio website built with vanilla HTML, CSS, and JavaScript. All website content (text, stats, projects, skills, etc.) is managed through JSON files in the `content/` directory, making it easy to update without touching the HTML or JavaScript source files.

---

## Project Structure

```
heroapps.github.io/
├── index.html              # Main entry point
├── assets/                 # Images, icons, and static media
├── content/                # JSON content files (edit these to update the site)
│   ├── masthead.json       # Hero / banner section
│   ├── portfolio.json      # Portfolio projects
│   ├── skills.json         # Core expertise and tech stack
│   ├── experience.json     # Work process steps
│   ├── about.json          # About section, stats, and testimonials
│   ├── contact.json        # Contact form, social links, and Google Calendar
│   ├── trusted-by.json     # Company logos and trust signals
│   └── header.json         # Navigation bar content
├── page/                   # HTML partials (injected by content-loader.js)
│   ├── header.html
│   ├── masthead.html
│   ├── skills.html
│   ├── portfolio.html
│   ├── experience.html
│   ├── about.html
│   ├── contact.html
│   ├── trusted-by.html
│   └── footer.html
├── css/                    # Stylesheets
│   ├── styles.css          # Main stylesheet (Bootstrap-based)
│   ├── design-system.css   # Design tokens and custom components
│   ├── masthead-override.css
│   ├── portfolio-expansion.css
│   ├── soundboard.css
│   └── ...                 # Additional modular stylesheets
└── js/                     # JavaScript modules
    ├── content-loader.js   # Loads HTML partials and injects JSON data
    ├── pages.js            # Page initialization
    ├── scripts.js          # General UI scripts
    ├── contact.js          # Contact form handling (Formspree)
    ├── portfolio-expansion.js  # Portfolio modal/drawer logic
    ├── number-counter.js   # Animated stat counters
    └── scroller.js         # Scroll behavior
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3, Bootstrap 5.2 |
| Scripting | Vanilla JavaScript (ES6+) |
| Icons | Font Awesome 6.3 |
| Animations | Lottie Player |
| Typography | Inter (Google Fonts) |
| Form Backend | Formspree |
| Hosting | GitHub Pages |

---

## Architecture

The site uses a **component injection pattern**. `index.html` contains only empty container `div` elements. On page load, `content-loader.js` fetches each HTML partial from the `page/` directory, binds the corresponding JSON data from `content/`, and injects the rendered markup into the appropriate container.

This separation means:

- **Content editors** only need to touch `content/*.json`
- **Layout changes** are made in `page/*.html`
- **Logic changes** are made in `js/*.js`

---

## Sections

| Section | Content File | HTML Partial |
|---|---|---|
| Navigation | `header.json` | `header.html` |
| Hero / Masthead | `masthead.json` | `masthead.html` |
| Trusted By | `trusted-by.json` | `trusted-by.html` |
| Core Expertise | `skills.json` | `skills.html` |
| Portfolio | `portfolio.json` | `portfolio.html` |
| How We Work | `experience.json` | `experience.html` |
| About | `about.json` | `about.html` |
| Contact | `contact.json` | `contact.html` |
| Footer | — | `footer.html` |

---

## Editing Content

All site content is stored as JSON in the `content/` directory. To make changes:

1. Open the relevant `.json` file in any text editor
2. Edit the values (keep keys and structure intact)
3. Save the file
4. Refresh the browser to see the changes

**JSON rules to follow:**
- Use double quotes `"` — never single quotes `'`
- Do not remove commas between items in arrays or objects
- Validate JSON at [jsonlint.com](https://jsonlint.com/) if something breaks

**To restore a file using Git:**
```bash
git checkout content/<filename>.json
```

---

## Running Locally

No build step is required. From the project root, run:

```bash
npx -y http-server -p 8080 -o
```

This starts a local server on port 8080 and opens the site in your default browser automatically.

---

## Deployment

The site is deployed automatically via **GitHub Pages** on every push to the `main` branch. No CI/CD configuration is required.

---

## Contact Form

The contact form is powered by [Formspree](https://formspree.io/). The Formspree endpoint ID is set in `content/contact.json`. To change the receiving email address, update the form ID in that file and configure it in your Formspree dashboard.