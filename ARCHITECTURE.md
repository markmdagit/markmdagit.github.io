# Architecture Overview

This document outlines the high-level architecture of the Marcos Alvarez personal portfolio and web development project.

## 1. System Overview

The project is a static website hosted on GitHub Pages, designed to showcase a career pivot from IT Support to Software/Computer Engineering. It primarily uses vanilla web technologies (HTML, CSS, JavaScript) to remain lightweight and performant, while selectively incorporating modern frameworks (React via Webpack) for more complex, data-driven components.

The site does not have a traditional backend server or database. Instead, it relies on client-side fetching of local JSON files for persistent data and external REST APIs for dynamic features.

## 2. Tech Stack

*   **Frontend Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **Component Framework:** React (for specific complex UI components like the Laptops Database).
*   **Build Tools:** Webpack, Babel (to compile React/JSX into browser-compatible JavaScript).
*   **Data Storage:** Local JSON files (`/data/`), `localStorage` (for caching and simple state persistence).
*   **Testing:** Python, Pytest, Playwright (for End-to-End browser testing).
*   **Hosting:** GitHub Pages.

## 3. Directory Structure

```text
.
├── css/                  # Global stylesheets (styles.css)
├── data/                 # Static JSON data files acting as a mock database
├── images/               # Image assets
├── js/                   # JavaScript files
│   ├── api-examples.js   # Logic for all external REST API integrations
│   ├── main.js           # Core site interactivity and dynamic content loading
│   ├── laptops.jsx       # React component source for the Laptops Database
│   └── bundle.js         # Compiled Webpack output (do not edit directly)
├── pages/                # Main HTML pages of the site
├── scripts/              # Python scripts for data generation/utilities
├── tests/                # E2E test suite (Python + Playwright)
├── index.html            # Root entry point (redirects to pages/index.html)
├── package.json          # Node.js dependencies and build scripts
└── webpack.config.js     # Webpack configuration for JSX/Babel compilation
```

## 4. Frontend Architecture

### 4.1. Core Application (`js/main.js`)
The core application is built with vanilla JavaScript. It handles DOM manipulation, event listening, theme toggling (Light/Dark mode), and fetching core project data to dynamically generate UI elements (like the Projects carousel).

### 4.2. API Integrations (`js/api-examples.js`)
External API logic is encapsulated in `api-examples.js`. It uses ES6 classes (e.g., `WeatherTracker`, `GitHubProfileAPI`) to manage state and fetch operations for various educational API endpoints. A custom `SimpleCache` utility is implemented using `localStorage` to cache responses, minimize redundant network calls, and handle rate limits.

### 4.3. React Components
For specific, interactive data grids (like the Laptops Database), React is used.
*   **Source:** `js/laptops.jsx` contains the React code.
*   **Build:** Webpack processes the JSX through Babel and outputs a single `bundle.js` file, which is then included in the relevant HTML page (`pages/laptops.html`).

## 5. Data Flow & Management

Since there is no live backend (e.g., Supabase integration is pending), the architecture relies on two main data sources:

1.  **Local Mock Database (`/data/*.json`):**
    Files like `projects.json`, `laptops.json`, and `supply_chain.json` serve as read-only data sources. The frontend fetches these files asynchronously via the Fetch API to populate tables, lists, and cards.
2.  **External REST APIs:**
    The site interfaces with numerous public APIs (GitHub, OpenWeather, Dictionary API, etc.). Responses are parsed and rendered dynamically into the DOM, often filtered or formatted to meet specific requirements (e.g., filtering out restricted words in the Meme Generator).
3.  **State Persistence:**
    `localStorage` is heavily utilized to persist the user's Theme preference (Dark/Light mode) and to temporarily cache API responses with a Time-To-Live (TTL) mechanism.

## 6. Testing Strategy

The repository employs End-to-End (E2E) testing to ensure UI functionality across different pages.
*   **Framework:** Pytest combined with Playwright (`pytest-playwright`).
*   **Scope:** Tests cover critical user flows, page metadata (e.g., ensuring correct titles), API example rendering, and theme toggling.
*   **Execution:** Tests are located in the `tests/` directory and run in a Python environment.

## 7. Build and Deployment

*   **Build Step:** Whenever changes are made to React components (`.jsx`), the developer must run `npm run build` (or `npx webpack`) to regenerate `js/bundle.js`.
*   **Deployment:** The `main` branch is connected to GitHub Pages. Pushing to `main` automatically deploys the static files, making the updates live. No CI/CD pipelines for complex backend deployments are necessary.
