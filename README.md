# Cade Bray Portfolio

A dependency-free cybersecurity portfolio combining a software engineering foundation with secure design, physical security, RFID, community involvement, and risk management.

## Status

The repository is designed for incremental implementation with small, understandable local Git commits. Update this section as major capabilities are completed.

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
        |-- js/
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

## Deployment

Deployment remains owner-controlled.

After reviewing the local commits, the owner can push them to the `Cade-Bray/portfolio` repository and configure GitHub Pages to deploy from the `main` branch and `/docs` folder. Codex must not create the remote, push, or change repository settings unless these repository rules are explicitly revised later.

## Maintenance

- Update page structure and content in `docs/index.html`.
- Keep component styles under `docs/assets/css/`.
- Keep JavaScript modules small and focused under `docs/assets/js/`.
- Use relative asset paths so the site works under the `/portfolio/` project path.
- Update this README whenever structure, preview instructions, deployment guidance, major features, accessibility behavior, or implementation status changes.
