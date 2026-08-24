# Cade Bray Portfolio

A dependency-free cybersecurity portfolio combining a software engineering foundation with secure design, connected systems, RFID, community involvement, and risk management.

## Status

Phases 0 through 6 are complete, including the decorative Canvas 2D network, pointer and touch interactions, accessibility and performance work, verified portfolio content, and release metadata.

The hero network uses a connected three-dimensional graph, perspective projection, calm bounded drift, responsive node counts, and lifecycle pausing. Ambient infections propagate through connected edges and recover automatically. Pointer proximity gently focuses and zooms the camera before triggering a bounded connected outbreak; contained touch taps trigger the same effect without blocking normal scrolling.

## Technology

- Semantic HTML5
- Modular CSS
- Vanilla JavaScript with native ES modules
- Canvas 2D for the decorative network animation
- GitHub Pages-compatible static hosting

The project intentionally has no package manager, framework, production dependency, backend, or build step.

## Repository layout

```text
portfolio/
|-- README.md
|-- .gitignore
`-- docs/
    |-- index.html
    |-- 404.html
    |-- .nojekyll
    `-- assets/
        |-- css/
        |   `-- components/
        |-- js/
        |   |-- config/
        |   |-- network/
        |   |-- ui/
        |   `-- utilities/
        |-- images/
        `-- icons/
```

All deployable site files live in `docs/`. Local planning and Codex instruction files remain untracked through `.gitignore`.

## Local preview

From the repository root, run:

```bash
python3 -m http.server 8000 --directory docs
```

Then open `http://localhost:8000/` in a modern browser.

A local web server is required because the browser loads the JavaScript as native ES modules.

## Implemented features

- Semantic, single-page portfolio with anchor navigation
- Responsive header with direct access to Projects, GitHub, and LinkedIn
- Hero, focus areas, selected projects, community timeline, about, and contact sections
- Connected perspective network with responsive node counts and calm three-dimensional drift
- Fresh randomized node placement on each page load
- Bounded ambient infections with connected edge pulses and automatic recovery
- Eased pointer focus and zoom with a slower release to prevent abrupt camera movement
- Bounded pointer and touch outbreaks that propagate through real graph connections
- Reused projection, adjacency, and outbreak buffers to reduce animation-loop allocations
- Viewport-aware pixel density and glow scaling to reduce mobile canvas work
- Automatic animation pausing when the hero or browser tab is not visible
- Verified project summaries based on the linked public repositories
- Open Graph and large-card social metadata with a project-local preview image
- Custom 404 page using the same visual language
- Dependency-free modular CSS and minimal native ES-module JavaScript

## Accessibility

The site includes semantic landmarks, a visible-on-focus skip link, fixed-header-safe anchor targets, ordered headings, visible keyboard focus styles, descriptive link text, touch-sized navigation targets, and reduced-motion-safe behavior. Infections change node size, halo, edge thickness, and line pattern in addition to color. The decorative canvas freezes to one static, lower-density red path when reduced motion is requested, and live preference changes also stop title animation and camera interaction. All meaningful content remains in the HTML and is available if JavaScript is disabled.

Final keyboard, screen-size, and visual checks remain the owner's responsibility before publishing.
