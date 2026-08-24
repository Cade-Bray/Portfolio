# Cade Bray Portfolio

A dependency-free cybersecurity portfolio combining a software engineering foundation with secure design, connected systems, RFID, community involvement, and risk management.

## Status

Phase 0 and Phase 1 are complete: the repository foundation, semantic single-page structure, responsive visual system, navigation, verified project summaries, profile content, contact links, and 404 page are implemented.

The decorative Canvas 2D network is intentionally deferred to Phase 2. The current hero remains readable and complete without animation.

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
        |   `-- ui/
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
- Verified project summaries based on the linked public repositories
- Custom 404 page using the same visual language
- Dependency-free modular CSS and minimal native ES-module JavaScript

## Accessibility

The static foundation includes semantic landmarks, a visible-on-focus skip link, ordered headings, visible keyboard focus styles, descriptive link text, touch-sized navigation targets, and reduced-motion-safe smooth scrolling. All meaningful content remains in the HTML and is available if JavaScript is disabled.

Final keyboard, screen-size, and visual checks remain the owner's responsibility before publishing.

## Deployment

Deployment remains owner-controlled.

After reviewing the local commits, the owner can:

1. Create or select the `Cade-Bray/portfolio` repository.
2. Add it as the local `origin` remote.
3. Push the local `main` branch.
4. In GitHub Pages settings, select **Deploy from a branch**, then choose `main` and `/docs`.

No remote or Pages configuration is required for local development. Codex does not create the remote, push, or change repository settings.

## Maintenance

- Update page structure and content in `docs/index.html`.
- Keep component styles under `docs/assets/css/`.
- Keep JavaScript modules small and focused under `docs/assets/js/`.
- Use relative asset paths so the site works under the `/portfolio/` project path.
- Update this README whenever structure, preview instructions, deployment guidance, major features, accessibility behavior, or implementation status changes.
