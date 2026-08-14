# SmartSyllabusAI frontend audit

## Findings
- The original UI repeated hard-coded colors and one-off card styles across every route.
- `App.css` still contained unused Vite starter selectors (`hero`, `framework`, `vite`, `next-steps`, `counter`).
- Dashboard, analytics, and detail routes had no shared application shell or navigation model.
- Loading used layout-independent spinners, causing poor perceived performance and potential layout shift.
- The create-course modal lacked focus trapping, Escape handling, and labelled generation progress.
- Heavy route code and visual code were loaded eagerly.
- Authentication errors exposed raw Firebase messages.

## Changes
- Added centralized CSS design tokens and a responsive application shell.
- Added premium dashboard, hero, generator, course library, empty, error, skeleton, analytics, and toast states.
- Added lazy routes and an idle-loaded, low-poly React Three Fiber hero scene with CSS/mobile/reduced-motion fallback.
- Preserved Firebase auth, service calls, generation behavior, editing, KaTeX, PDF exports, and routing.
- Added accessible modal focus management, semantic controls, visible focus, live regions, and reduced-motion handling.
- Removed legacy starter CSS and added SEO/social metadata plus a custom favicon.
