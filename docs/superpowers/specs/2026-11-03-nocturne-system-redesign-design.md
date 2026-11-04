# Nocturne Hybrid System Redesign

## Intent

Replace the application's generic gray-and-indigo template appearance with a cohesive premium identity across every user-facing surface. This is a visual and UX-system redesign of the existing product, not an automation or feature project.

The redesign should make the current internal workspace feel dependable and calm while creating a foundation that can later support workflow automation and eventual productization. The public portfolio and private workspace must feel like two modes of the same Wender Tech product.

## Why This Work Exists

The current interface communicates its information but relies on familiar admin-template patterns: uniform gray cards, generic indigo accents, repeated section titles, and limited hierarchy. It feels assembled rather than authored. The redesign must create visual identity without reducing the scanability required for daily operational use.

## Confirmed Product Truth

The durable product context is recorded in `PRODUCT.md`. The primary operator is Wender, with a possible small internal team later. Public visitors are prospective clients and partners. Existing functionality, content, data, permissions, integrations, languages, and routes remain authoritative.

## Scope

All user-facing surfaces are in scope:

- Public portfolio: home, services, projects, project browsing, developer/company presentation, contact, navigation, and footer.
- Authentication: login, registration state, forgot password, reset password, loading, validation, and errors.
- Workspace shell: sidebar/rail, top context bar, responsive navigation, account controls, global feedback, and loading states.
- Workspace overview: context, priorities, metrics, pending reminders, recent projects, and next actions.
- Project management: project list, creation, editing, deletion confirmation, images, technologies, empty states, and responsive tables/lists.
- Profile management: personal profile and company profile forms, images, AI-assisted bio flow, save/cancel feedback, and validation.
- Calendar and reminders: calendar surface, reminder filters, creation/editing, completion, deletion, priority, empty states, and upcoming work.
- Integrations: integration index, AI providers/models, Evolution messaging and instances, Resend email, NFS-e homologation, setup/test states, credentials, warnings, and results.
- Supporting UI: dialogs, popovers, selects, inputs, textareas, badges, switches, tabs, toasts, skeletons, tooltips, tag input, error states, and not-found/unauthorized states where present.
- Transactional email templates should inherit the core identity in an email-safe form.
- `/test-upload` and other shipped utility surfaces inherit the system but do not receive bespoke concepts.

Backend APIs, database models, NFS-e protocol behavior, authentication behavior, and automation features are out of scope except where a presentational change needs an existing response to be rendered more clearly.

## Approved Direction: Nocturne Hybrid

The approved direction combines the immersive dark atmosphere of the Nocturne concept with the minimal navigation and useful context of Obsidian Signal.

### Visual World

- Deep graphite and blue-black foundations, never pure black across the entire interface.
- Restrained violet as the primary action and identity color.
- Neutral elevation and border separation instead of chromatic glow.
- Compact geometric iconography and a circular `W` signature.
- Calm, generous composition with clear density changes rather than a wall of identical cards.
- Clean sans-serif typography; no editorial serif or old-newspaper cues.
- Rounded geometry is controlled: approximately 10–16px for operational surfaces, circular only for identity/avatar/status elements, and no excessive pill-shaped containers.

### Approved Prototype Evidence

The visual reference is:

`.superpowers/brainstorm/594454-1793731214/content/nocturne-hybrid-v2.html`

The prototype is directional, not production code. Its approved characteristics are binding:

- centered circular `W`;
- geometric rail icons;
- `Workspace / Visão geral` context;
- current date near the primary greeting/status;
- task-reassuring language such as `Tudo sob controle` when truthful;
- dark blue-black surfaces and restrained violet;
- a priority panel and upcoming-work summary that make the overview actionable.

Prototype placeholder data, exact dimensions, and decorative glyphs are not binding. Production content must come from existing data and translations.

## Design Tokens

Create semantic CSS variables in `src/app/globals.css` and map Tailwind utilities/components to them. Avoid route-local hard-coded palettes.

### Core palette

- Canvas: `#08090D`
- Workspace background: `#0C0D12`
- Surface: `#14151A`
- Raised surface: `#18171E`
- Interactive surface: `#211E2A`
- Border: `#2A2932`
- Strong border: `#413C50`
- Primary text: `#F3F1F8`
- Secondary text: `#AAA6B4`
- Muted text: no darker than the WCAG AA value appropriate to its surface
- Primary violet: `#A995FF`
- Primary violet hover/pressed: derive darker states that preserve contrast and do not glow
- Violet-on-primary ink: `#17131F`

Success, warning, destructive, and informational colors remain semantic and distinct from brand violet. Use subdued backgrounds with readable foregrounds. Never communicate status only by hue.

### Typography

- Use `Manrope` through `next/font/google`, with a robust system-sans fallback.
- Page display: 40–56px desktop, fluid down to 32–40px mobile, tight but legible tracking.
- Page title: 28–36px.
- Section title: 18–24px.
- Body: 14–16px, line-height 1.5–1.7.
- Operational labels and metadata: never below 12px.
- Avoid uppercase sentences. Uppercase is limited to short status or category labels.

### Spacing and geometry

- Use a 4px base with primary steps of 8, 12, 16, 24, 32, 40, 48, and 64px.
- Touch/click targets are at least 40px, ideally 44px on mobile.
- Use one-pixel borders for separation and neutral shadows only when elevation is necessary.
- Surfaces must not all share the same radius, padding, and weight; hierarchy should be visible from composition, not decorative variation.

## Information Architecture and Shell

### Desktop workspace

- A persistent compact left rail uses the circular `W` at the top and geometric line icons centered within consistent targets.
- The active item uses a restrained violet surface and a narrow positional indicator; it must not become a glowing tile.
- The rail may expand to reveal labels when helpful, but icon alignment must remain stable between states.
- A slim context bar contains a meaningful breadcrumb, notification/account controls, and no redundant `Dashboard` heading.
- The content area owns the page title, date or relevant context, actions, and workflow state.

### Mobile workspace

- Replace the persistent rail with a compact top bar and an accessible drawer or bottom-oriented navigation pattern selected during implementation based on the existing route depth.
- Preserve breadcrumb meaning in a shortened form; do not squeeze desktop chrome into the viewport.
- Tables become structured list rows/cards only where horizontal comparison is not essential. Preserve essential actions and status.

### Public shell

- Use the same palette, typography, icon language, borders, and motion grammar.
- Public navigation is lighter and more expressive than the workspace rail but retains the circular `W` signature.
- The public first viewport must show real work or a real capability, not a generic gradient hero.

## Surface Behavior

### Workspace overview

The first viewport should answer three questions without scrolling:

1. Where am I?
2. What needs attention today?
3. Is anything at risk of being forgotten?

Use the current date, a truthful status line, a small set of meaningful metrics, priority reminders, recent projects, and upcoming items. If data is absent, replace reassurance with an honest empty-state message. Do not display `Tudo sob controle` when overdue or failed items exist.

For this redesign, the overview derives its priority language only from existing reminder and project data; it does not create a new cross-integration health aggregator. Order reminder attention as: overdue and incomplete first, due today second, then future incomplete reminders by ascending due date. `Tudo sob controle` is permitted only when there are no overdue incomplete reminders. When overdue work exists, use truthful attention copy; when reminder data is loading, failed, or unavailable, use neutral copy that makes no reassurance claim. Integration failures remain visible on their own integration surfaces until a later automation project intentionally introduces aggregate health.

### Lists and tables

- Prioritize primary identity, status, freshness, and the next action.
- Keep destructive actions visually quiet until invoked, then explicit in confirmation.
- Use hover for enhancement only; all actions remain keyboard and touch accessible.
- Empty states explain what the area is for and offer one clear first action.

### Forms

- Group fields by user intent rather than database shape.
- Use section introductions only where they reduce ambiguity.
- Labels remain visible; placeholders are examples, not label replacements.
- Show validation near the relevant field and provide a clear form-level result.
- Sticky action regions are permitted on long forms when they do not obscure content.

### Integrations

- Each integration presents status first: not configured, configured, testing, connected, attention required, or failed.
- Provider marks are supporting evidence, not oversized decorative tiles.
- Credentials and sensitive values use clear masking/reveal behavior already supported by the product.
- Setup, test, and destructive reset actions are visually distinct.
- NFS-e homologation must make environment and non-production status unmistakable without using alarm styling for every section.

### Authentication

- Use a focused composition with a strong Wender Tech signature and minimal distraction.
- Keep form width readable and validation immediate.
- Do not use a generic centered white card on a decorative gradient.

### Public portfolio

- Mode: Persuade/Experience. Real projects and capabilities lead the composition.
- Avoid repeating generic agency claims when project evidence can demonstrate expertise.
- Vary section density and scale while preserving one spacing rhythm.
- Contact remains the clear closing action.
- Existing factual copy may be clarified but not replaced with invented claims.

## Motion

- Use Framer Motion already installed in the project.
- One motion grammar: quick opacity/position transitions, restrained stagger for meaningful groups, and a single stronger transition for route/section arrival.
- Typical duration: 160–280ms for controls, up to 450ms for page arrival.
- No floating loops, chromatic glow pulses, excessive parallax, or animation that delays access to content.
- Honor `prefers-reduced-motion`; content is visible without waiting for animation.

## Component Strategy

Refactor shared primitives before styling individual pages:

- semantic color/type/spacing tokens;
- button variants and icon buttons;
- field, textarea, select, switch, tabs, badge, tooltip, popover, dialog, alert dialog, skeleton, and toast;
- page header, breadcrumb, section header, status treatment, empty state, loading state, and error state;
- workspace shell and public shell;
- reusable data row/list patterns where the existing product repeats them.

Reuse installed dependencies and existing application structure. Do not add a second component library, a CSS-in-JS layer, or a new state-management system. Prefer `lucide-react`, already installed, as the consistent production icon set; the prototype glyphs describe geometry, not literal characters.

## Responsive and Internationalization Requirements

- Verify at 1440px desktop, 1024px as the required compact in-app-browser target, and 390px mobile. If the review harness exposes a different actual user viewport during implementation, add that width to the matrix without removing these three baselines.
- No fixed-width layout may depend on a single desktop capture.
- Portuguese and English must both render without truncation; navigation, buttons, tabs, status labels, and tables must tolerate expansion.
- Navigation and primary actions remain usable at 200% zoom.
- Images use correct aspect handling and never create horizontal overflow.

## Accessibility Requirements

- WCAG AA contrast for text and interactive states.
- Semantic headings and landmarks with no skipped hierarchy.
- Visible `:focus-visible` treatment using violet plus a neutral offset where necessary.
- Every icon-only action has an accessible name and tooltip where the meaning is not universal.
- Dialog focus trapping, escape behavior, and return focus remain correct through Radix primitives.
- Inputs expose labels, descriptions, validation, and disabled/loading state programmatically.
- Charts or metrics, if added later, require text equivalents; this redesign does not add decorative charts.

## Content Rules

- Preserve existing product facts and translations.
- Replace redundant structural copy with context only when meaning is unchanged.
- Reassuring language must reflect actual state.
- Do not invent clients, testimonials, results, automation, financial metrics, or integration success.
- Synthetic data may appear only in design/test fixtures and must be labeled as synthetic outside the prototype.

## Implementation Sequence

1. Establish tokens, font, focus, body canvas, and shared primitives.
2. Build the responsive workspace shell and migrate the overview as the reference implementation.
3. Migrate workspace management screens: projects, profiles, calendar, and reminders.
4. Migrate integration screens and their complex states.
5. Migrate authentication flows.
6. Redesign the public portfolio in the same visual world, using real existing content and assets.
7. Align transactional email templates with an email-safe subset of the system.
8. Run responsive, accessibility, translation, and visual consistency verification across all routes.

This order is a planning constraint, not permission to leave the product visually split at handoff. The delivered redesign must cover the full agreed scope.

## Acceptance Criteria

- Every user-facing route inherits Nocturne Hybrid tokens and shared components.
- No route retains the old gray/indigo template identity unless it is an external embedded surface outside project control.
- The workspace overview matches the approved direction and provides truthful context, priority, and next actions.
- Public and private surfaces clearly belong to one product while serving their different modes.
- Desktop and mobile navigation are complete and keyboard accessible.
- Portuguese and English render without material clipping or broken hierarchy.
- Loading, empty, success, warning, failure, validation, and destructive-confirmation states are designed consistently.
- No new feature, automation, data model, claim, or dependency is introduced solely for the redesign.
- Existing functional tests continue to pass; build/type/lint checks pass using the repository's available scripts.
- Visual inspection covers desktop, mobile, and the user's in-app browser width in at most two bounded correction rounds.

## Explicit Non-Goals

- Building workflow automations.
- Converting the application into a multi-tenant SaaS product.
- Changing database schemas, permissions, authentication semantics, or integration protocols.
- Rewriting marketing claims or fabricating social proof.
- Adding analytics, billing, onboarding, team management, or new dashboards.
- Preserving the old visual system for familiarity's sake.

## Risks and Mitigations

- **Large surface area:** migrate shared primitives and shells first, then route groups, to avoid route-by-route drift.
- **Dirty existing worktree:** preserve all pre-existing modifications and keep redesign edits scoped; do not normalize unrelated files.
- **Dark-theme legibility:** enforce semantic contrast tokens and test real dense forms, not only the overview.
- **Visual overexpression:** violet is an accent, not a background wash; avoid glow, repeated gradient cards, and gamer cues.
- **False reassurance:** derive status language from available data and use neutral fallback copy when state is incomplete.
- **Future-product overengineering:** create reusable visual foundations now but defer roles, tenancy, billing, and automation abstractions.

## Decisions Left to the Builder

- Exact internal naming of token variables and component files, provided the semantic model above is preserved.
- Whether the mobile workspace navigation uses a drawer or a compact bottom pattern after testing route depth and current interaction constraints.
- The smallest responsible boundaries for shared list/form patterns based on actual repetition in the code.
- Exact responsive breakpoints within the required target sizes.
- Minor copy adjustments needed for truthful state handling, using the existing translation structure and without changing product claims.
