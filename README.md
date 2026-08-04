# Bapan Sk — Personal Portfolio Website

A modern, premium, fully responsive personal portfolio website for **Bapan Sk** —
B.Tech Information Technology student, Full Stack Developer and AI Enthusiast.

![Tech](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Tech](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Tech](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

##  Features

- **Dark / Light mode** toggle with persistence
- **Glassmorphism** UI with blue & cyan gradient accents
- **12 sections**: Hero, About, Skills, Projects, Experience, Education, Certifications,
  Achievements, GitHub, Testimonials, Contact, Footer
- **Typewriter effect**, custom cursor, particle background, floating shapes
- **Animated counters**, scroll progress bar, AOS scroll reveal
- **GitHub API integration** — live profile stats + contribution calendar
- **Testimonial slider** with autoplay, dots and swipe support
- **Contact form** with real-time email validation (mailto fallback)
- **Custom 404 page**, SEO meta tags, Open Graph tags, favicon
- **Sticky navbar**, active link highlight, mobile hamburger menu
- **Lazy loaded images**, back-to-top button, preloader
- Lighthouse-friendly: optimized CSS/JS, mobile-first, `prefers-reduced-motion` support

##  Folder Structure

```
portfolio/
│
├── index.html          # Home (all sections)
├── about.html          # About page
├── projects.html       # Projects page (with filters)
├── contact.html        # Contact page
├── 404.html            # Custom 404 page
├── css/
│   ├── style.css       # Main styles (variables, dark/light, components)
│   ├── responsive.css  # Responsive / mobile-first breakpoints
│   └── animations.css  # Keyframes + reduced-motion rules
├── js/
│   ├── script.js       # Theme, cursor, navbar, typewriter, sliders, forms...
│   ├── github.js       # GitHub API + contribution calendar
│   └── particles.js    # Canvas particle background
├── assets/
│   ├── images/         # Profile, about, project images
│   ├── icons/          # Favicons
│   ├── resume/         # BapanSk_Resume.pdf
│   └── certificates/   # Certificate PDFs
└── README.md
```

##  Getting Started

No build tools required — it's pure HTML/CSS/JS.

```bash
# Serve the folder (any static server works)
npx serve portfolio
```

Or simply open `index.html` in a browser.

##  Customization

### GitHub data
Open `js/github.js` and change the username:

```js
const GITHUB_USERNAME = 'BapanSk';
```

### Personal info & links
Edit the email / social URLs across the HTML files (search for `bapansk.official`).

### Resume & certificates
Replace the files in `assets/resume/` and `assets/certificates/` with your own.

### Colors & theme
All colors are controlled by CSS variables at the top of `css/style.css`.

##  Links

- Live demo: https://bapansk.github.io/portfolio/
- GitHub: https://github.com/BapanSk

##  License

© 2026 Bapan Sk. All rights reserved.
