# Nocturne Hybrid System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every user-facing Wender Tech surface with the approved Nocturne Hybrid identity while preserving current behavior, content, data flows, authentication, integrations, and translations.

**Architecture:** Establish semantic tokens and shared primitives first, then migrate the workspace shell and route groups outward from the overview. Public, authentication, management, and integration surfaces reuse the same token and component contracts while varying composition for their Operate, Persuade, and Experience modes.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, `next-intl`, Radix UI, Framer Motion, Lucide React, `node:test` through `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-03-nocturne-system-redesign-design.md`

## Global Constraints

- Preserve all current routes, APIs, database models, authentication, permissions, integrations, content, and translations.
- Use the approved Nocturne Hybrid palette: canvas `#08090D`, workspace `#0C0D12`, surface `#14151A`, raised `#18171E`, interactive `#211E2A`, border `#2A2932`, strong border `#413C50`, text `#F3F1F8`, secondary `#AAA6B4`, violet `#A995FF`, violet ink `#17131F`.
- Use `Manrope` through `next/font/google`; operational text is never smaller than 12px and body text is 14–16px.
- Use existing dependencies only; do not add another UI library, styling layer, or state manager.
- Use Lucide React as the production icon set; prototype glyphs are compositional references only.
- Keep violet restrained: no chromatic glow, decorative halo, gamer styling, or repeated gradient cards.
- Maintain WCAG AA contrast, semantic landmarks/headings, visible focus, reduced-motion support, 40–44px interactive targets, and non-color status cues.
- Support Portuguese and English text expansion without clipping.
- Verify 1440px, 1024px, and 390px; add the live in-app-browser width if exposed during review.
- Preserve the user's pre-existing dirty-worktree changes. Commit steps stage only reviewed task files; if an overlapping file cannot be isolated safely, skip that commit and record the checkpoint instead of committing unrelated work.

## Review Focus

- Overdue incomplete reminders: the overview must show attention copy and must never render `Tudo sob controle`; pinned by Task 2 unit tests.
- Loading, failed, or absent reminder data: the overview must use neutral copy and never false reassurance; pinned by Task 2 unit tests.
- Long Portuguese/English labels: navigation, tabs, buttons, and dense integration forms must wrap or resize without clipping at 1024px and 390px; checked in Tasks 3, 4, 5, and 7.
- Keyboard and reduced-motion use: every shell/action/dialog remains operable with visible focus and content is available without entrance animation; checked in Tasks 1, 2, and 7.
- Existing saved integration/configuration states: redesign must render configured, testing, failed, and unconfigured states without changing request payloads or destructive behavior; checked in Task 4.

---

### Task 1: Nocturne Tokens, Font, and Shared Primitives

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Modify: `src/components/ui/label.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/switch.tsx`
- Modify: `src/components/ui/tabs.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/alert-dialog.tsx`
- Modify: `src/components/ui/popover.tsx`
- Modify: `src/components/ui/dropdown-menu.tsx`
- Modify: `src/components/ui/tooltip.tsx`
- Modify: `src/components/ui/skeleton.tsx`
- Modify: `src/components/ui/sonner.tsx`
- Modify: `src/components/Button.tsx`
- Modify: `src/components/LoadingSpinner.tsx`
- Modify: `src/components/LanguageSwitcher.tsx`
- Modify: `src/components/TagInput.tsx`

**Interfaces:**
- Consumes: existing Radix primitives, Tailwind 4 theme mapping, `cn()` from `src/lib/utils.ts`.
- Produces: semantic CSS variables; `buttonVariants`; shared focus, surface, field, status, loading, and motion classes used by every later task.

- [ ] **Step 1: Replace the root font contract**

Configure `Manrope` in `src/app/layout.tsx` as `--font-manrope`, keep `Geist_Mono` for code/data, remove route-level gray body classes, and set the root body to the semantic canvas/text contract.

- [ ] **Step 2: Implement semantic tokens and global behavior**

Replace legacy gray/indigo theme values in `src/app/globals.css` with the exact global palette, typography, spacing, focus, scrollbar, selection, reduced-motion, and base surface rules from the spec. Preserve Tailwind's existing variable names so Radix/shadcn components inherit the redesign.

- [ ] **Step 3: Restyle form and overlay primitives**

Update the listed `src/components/ui/*` files to consume semantic tokens, use 10–16px corner radii, 40px minimum targets, visible `focus-visible` state, neutral elevation, and readable disabled/error states. Do not change exported names or Radix behavior.

- [ ] **Step 4: Unify legacy shared components**

Map `src/components/Button.tsx`, `LoadingSpinner`, `LanguageSwitcher`, and `TagInput` to the same tokens and interaction rules without changing their public props.

- [ ] **Step 5: Verify foundation**

Run: `npx tsc --noEmit`

Expected: exit 0 with no new type errors.

Run: `npx eslint src/app/layout.tsx src/components/ui src/components/Button.tsx src/components/LoadingSpinner.tsx src/components/LanguageSwitcher.tsx src/components/TagInput.tsx`

Expected: exit 0, or only documented pre-existing warnings unrelated to the changed code.

- [ ] **Step 6: Commit the foundation checkpoint if safe**

Review `git diff -- <task files>` and stage only the files above. Commit as `feat(ui): establish nocturne design foundation` only if no unrelated pre-existing hunks would be included.

### Task 2: Responsive Workspace Shell and Truthful Overview

**Files:**
- Create: `src/lib/dashboard-status.ts`
- Create: `tests/ui/dashboard-status.test.ts`
- Create: `src/components/dashboard/WorkspaceHeader.tsx`
- Modify: `src/components/DashboardSidebar.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/dashboard/PendingReminders.tsx`
- Modify: `messages/pt-BR.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: Task 1 tokens/primitives; existing `Reminder` type and portfolio/reminder hooks.
- Produces: `getDashboardStatus(reminders: Reminder[] | undefined, state: 'loading' | 'ready' | 'error', now: Date): DashboardStatus`; responsive workspace rail/header; overview composition used as the private-surface reference.

- [ ] **Step 1: Write failing dashboard-status tests**

Create tests for: overdue incomplete reminder → `attention`; only future/today reminders → `controlled`; loading/error/undefined → `neutral`; completed overdue reminder ignored; priority order is overdue, today, then future ascending.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npx tsx --test tests/ui/dashboard-status.test.ts`

Expected: FAIL because `getDashboardStatus` does not exist.

- [ ] **Step 3: Implement `getDashboardStatus`**

Return `{ tone: 'controlled' | 'attention' | 'neutral'; priority: Reminder[]; overdueCount: number; dueTodayCount: number }`. Compare dates in the user's local day, exclude completed reminders, and make no integration-health claim.

- [ ] **Step 4: Run tests and confirm pass**

Run: `npx tsx --test tests/ui/dashboard-status.test.ts`

Expected: all dashboard-status tests pass.

- [ ] **Step 5: Build the workspace shell**

Implement the circular `W`, centered Lucide icons, stable compact/expanded rail alignment, active indicator, accessible labels/tooltips, 44px mobile controls, contextual breadcrumb, and mobile navigation. Keep authentication redirect behavior unchanged.

- [ ] **Step 6: Recompose the overview**

Replace repeated equal cards with the approved date/status thesis, three meaningful metrics, priority summary, pending reminders, recent projects, and upcoming work. Use `getDashboardStatus` so reassuring copy is truthful; preserve existing links and hook data.

- [ ] **Step 7: Add translation copy**

Add matching Portuguese and English keys for breadcrumbs, status tones, priority copy, metric notes, and mobile navigation. Do not hard-code user-facing overview text.

- [ ] **Step 8: Verify shell and overview**

Run: `npx tsx --test tests/ui/dashboard-status.test.ts && npx tsc --noEmit`

Expected: tests pass and TypeScript exits 0.

Keyboard check: tab through rail, expansion, profile controls, overview links, and mobile menu; focus remains visible and the drawer returns focus when closed.

- [ ] **Step 9: Commit the workspace checkpoint if safe**

Review and stage only Task 2 files. Commit as `feat(dashboard): add nocturne workspace and overview` if overlapping user hunks are not included.

### Task 3: Core Management Surfaces

**Files:**
- Create: `src/components/dashboard/PageHeader.tsx`
- Create: `src/components/dashboard/EmptyState.tsx`
- Create: `src/components/dashboard/StatusBadge.tsx`
- Modify: `src/app/dashboard/projects/page.tsx`
- Modify: `src/app/dashboard/projects/new/page.tsx`
- Modify: `src/app/dashboard/projects/[id]/page.tsx`
- Modify: `src/app/dashboard/profile/page.tsx`
- Modify: `src/app/dashboard/company/page.tsx`
- Modify: `src/app/dashboard/calendar/page.tsx`
- Modify: `src/app/dashboard/reminders/page.tsx`
- Modify: `src/components/reminders/ReminderFilters.tsx`
- Modify: `src/components/reminders/ReminderForm.tsx`
- Modify: `src/components/reminders/ReminderItem.tsx`
- Modify: `src/components/reminders/CompactReminderItem.tsx`

**Interfaces:**
- Consumes: Task 1 primitives and Task 2 workspace shell.
- Produces: `PageHeader`, `EmptyState`, and `StatusBadge` contracts reused by integrations and utility screens.

- [ ] **Step 1: Create shared management patterns**

Implement focused components with props matching existing route needs: `PageHeader({ eyebrow?, title, description?, actions?, backHref? })`, `EmptyState({ icon, title, description, action? })`, and `StatusBadge({ tone, children })` where tone is `neutral | success | warning | danger | info`.

- [ ] **Step 2: Migrate project routes**

Restyle list/create/edit/detail states, preserve forms and CRUD handlers, make the desktop table responsive, and keep destructive confirmation explicit but visually quiet until invoked.

- [ ] **Step 3: Migrate profile and company forms**

Group fields by identity, contact, public presence, and content intent. Preserve upload, remove, save, AI bio, validation, and error behavior; add a non-obscuring action region for long forms.

- [ ] **Step 4: Migrate reminders and calendar**

Apply the shared hierarchy to filters, reminder creation, priority/due status, completion, deletion, empty/error/loading states, and the calendar placeholder without inventing scheduling functionality.

- [ ] **Step 5: Verify management routes**

Run: `npx tsc --noEmit`

Run: `npx eslint src/app/dashboard/projects src/app/dashboard/profile src/app/dashboard/company src/app/dashboard/calendar src/app/dashboard/reminders src/components/reminders src/components/dashboard/PageHeader.tsx src/components/dashboard/EmptyState.tsx src/components/dashboard/StatusBadge.tsx`

Expected: no new errors.

At 1024px and 390px, verify long PT-BR and EN labels wrap, project actions remain reachable, and forms have no horizontal overflow.

- [ ] **Step 6: Commit the management checkpoint if safe**

Commit reviewed Task 3 files as `feat(dashboard): redesign management workflows` only when staging can exclude unrelated hunks.

### Task 4: Integration Surfaces and Operational States

**Files:**
- Modify: `src/app/dashboard/integrations/page.tsx`
- Modify: `src/app/dashboard/integrations/ai/page.tsx`
- Modify: `src/app/dashboard/integrations/evolution/page.tsx`
- Modify: `src/app/dashboard/integrations/resend/page.tsx`
- Modify: `src/app/dashboard/integrations/nfse/page.tsx`
- Modify: `src/components/ai/AIProviderCard.tsx`
- Modify: `src/components/ai/ModelSelector.tsx`
- Modify: `src/components/messaging/EvolutionProviderCard.tsx`
- Modify: `src/components/messaging/EvolutionInstanceManager.tsx`
- Modify: `src/components/messaging/ResendProviderCard.tsx`

**Interfaces:**
- Consumes: Tasks 1–3 primitives, workspace shell, headers, and status treatments.
- Produces: visually consistent `unconfigured`, `configured`, `testing`, `connected`, `attention`, and `failed` presentations without changing API payloads.

- [ ] **Step 1: Redesign the integration index**

Lead with connection status and purpose rather than equal logo cards. Keep existing routes and provider imagery; use the shared status vocabulary.

- [ ] **Step 2: Migrate AI configuration**

Preserve provider/model selection, save/test/error behavior, and query hooks. Make disabled, unavailable, configured, and active states readable without color-only cues.

- [ ] **Step 3: Migrate messaging and email configuration**

Preserve Evolution instance management, default-instance behavior, QR/setup flows, Resend configuration, test actions, masking, loading, and destructive controls.

- [ ] **Step 4: Migrate NFS-e homologation**

Keep every existing field and emission action. Make the homologation environment unmistakable, separate certificate/configuration/emission/result regions, and preserve current security and protocol behavior.

- [ ] **Step 5: Verify integration state coverage**

Run: `npx tsc --noEmit`

Run: `npx eslint src/app/dashboard/integrations src/components/ai src/components/messaging`

Expected: no new errors.

Manually exercise each locally available state: unconfigured, configured, testing/loading, success, failure, and destructive confirmation. Confirm no request body, endpoint, or credential behavior changed.

- [ ] **Step 6: Commit the integration checkpoint if safe**

Commit reviewed Task 4 files as `feat(integrations): apply nocturne operational design` only when staging is isolated.

### Task 5: Authentication and Recovery

**Files:**
- Create: `src/components/auth/AuthShell.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/forgot-password/page.tsx`
- Modify: `src/app/reset-password/page.tsx`

**Interfaces:**
- Consumes: Task 1 form/button/focus primitives and root identity tokens.
- Produces: `AuthShell({ eyebrow?, title, description?, children, footer? })` used by all authentication routes.

- [ ] **Step 1: Build the focused auth shell**

Implement the circular `W`, dark spatial composition, readable form column, and calm supporting context without a generic white card or decorative halo.

- [ ] **Step 2: Migrate login/register state**

Preserve auth provider calls, validation, loading, mode switching, social actions, and navigation. Restyle through `AuthShell` and shared fields/buttons.

- [ ] **Step 3: Migrate forgot/reset flows**

Preserve token handling, password validation, success/error states, redirects, and recovery actions. Remove duplicated presentational markup in favor of `AuthShell` without combining behavioral state machines.

- [ ] **Step 4: Verify auth states**

Run: `npx tsc --noEmit`

Run: `npx eslint src/app/login/page.tsx src/app/forgot-password/page.tsx src/app/reset-password/page.tsx src/components/auth/AuthShell.tsx`

Expected: no new errors.

At 390px, verify long errors wrap, password controls remain reachable, loading does not shift layout materially, and tab order follows the form.

- [ ] **Step 5: Commit the auth checkpoint if safe**

Commit reviewed Task 5 files as `feat(auth): redesign authentication experience` only when staging is isolated.

### Task 6: Public Portfolio and Project Experience

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/projects/page.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/components/ParallaxSection.tsx`
- Modify: `src/components/landing/HeroSection.tsx`
- Modify: `src/components/landing/ServicesSection.tsx`
- Modify: `src/components/landing/ProjectsSection.tsx`
- Modify: `src/components/landing/AboutSection.tsx`
- Modify: `src/components/landing/DeveloperSection.tsx`
- Modify: `src/components/landing/ContactSection.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/primitives and existing portfolio data provider/content/assets.
- Produces: the Persuade/Experience expression of Nocturne Hybrid using real project/company/developer data.

- [ ] **Step 1: Rebuild public navigation and page rhythm**

Apply the circular `W`, restrained violet action, accessible mobile menu, section wayfinding, and one spacing rhythm. Preserve locale and auth-aware dashboard/login links.

- [ ] **Step 2: Recompose the first viewport**

Lead with Wender Tech's actual software capability and real project evidence, not a generic gradient hero. Preserve existing factual copy and calls to projects/contact; use motion once as material and honor reduced motion.

- [ ] **Step 3: Migrate services, projects, company, developer, and contact**

Vary density/scale while keeping the approved palette and typography. Preserve form submission, real images/data, social/contact links, and project navigation. Avoid equal icon-card repetition.

- [ ] **Step 4: Migrate the all-projects route and footer**

Use the same project presentation and public shell. Ensure empty/loading states and footer navigation remain clear in both locales.

- [ ] **Step 5: Verify public experience**

Run: `npx tsc --noEmit`

Run: `npx eslint src/app/page.tsx src/app/projects/page.tsx src/components/Navbar.tsx src/components/Footer.tsx src/components/ProjectCard.tsx src/components/ParallaxSection.tsx src/components/landing`

Expected: no new errors.

At 1440px, 1024px, and 390px, verify first-time comprehension, no invented claims, real images load, navigation works, contact remains the closing action, and reduced motion leaves all content visible.

- [ ] **Step 6: Commit the public checkpoint if safe**

Commit reviewed Task 6 files as `feat(portfolio): introduce nocturne public experience` only when staging is isolated.

### Task 7: Utility Surface, Emails, Internationalization, and Full Verification

**Files:**
- Modify: `src/app/test-upload/page.tsx`
- Modify: `src/components/email/ContactFormEmailTemplate.tsx`
- Modify: `src/components/email/ReminderNotificationEmail.tsx`
- Modify: `src/components/email/TestEmailTemplate.tsx`
- Modify: `messages/pt-BR.json`
- Modify: `messages/en.json`
- Create: `DESIGN.md`
- Create: `.impeccable/design.json`

**Interfaces:**
- Consumes: all earlier task contracts and the approved design spec.
- Produces: complete user-facing coverage, durable design-system documentation, and final verification evidence.

- [ ] **Step 1: Apply inherited styling to the utility route**

Migrate `/test-upload` to shared tokens and primitives without expanding its purpose.

- [ ] **Step 2: Align email-safe identity**

Update transactional templates with email-safe canvas/surface/text/violet colors, clear hierarchy, and existing content/links. Do not use web-only CSS or change delivery behavior.

- [ ] **Step 3: Audit translation parity**

Compare changed keys in `messages/pt-BR.json` and `messages/en.json`; ensure every new user-facing string exists in both and no route relies on hard-coded structural copy.

- [ ] **Step 4: Run automated verification**

Run: `npx tsx --test tests/ui/dashboard-status.test.ts tests/nfse/*.test.ts`

Expected: all tests pass.

Run: `npx tsc --noEmit`

Expected: exit 0.

Run: `npm run build`

Expected: production build completes successfully.

- [ ] **Step 5: Run bounded visual verification**

Start the application and capture the required representative surfaces at 1440px, 1024px, and 390px: public home, login, workspace overview, project list/form, reminders, one profile form, integration index, AI, Evolution/Resend, and NFS-e. Inspect once, batch material fixes, then confirm with at most one second capture round.

- [ ] **Step 6: Run accessibility and interaction checks**

Keyboard-check public navigation, auth forms, workspace navigation, dialogs, forms, and integration controls. Confirm focus visibility, semantic headings/landmarks, touch target sizing, reduced-motion behavior, non-color statuses, and no horizontal overflow at 200% zoom.

- [ ] **Step 7: Run the Impeccable detector once on changed UI targets**

Run the detector against the final changed web UI, fix mechanical issues, and do not run it a second time. Record any remaining intentional finding for the final reviewer.

- [ ] **Step 8: Complete independent finish review**

Provide the original request, spec, approved prototype, changed artifact paths, screenshots, detector findings, and craft-floor reference to a fresh finish reviewer. Apply one batched fix round if requested and obtain a verdict on those fixes.

- [ ] **Step 9: Document the implemented design system**

After the final visual result is accepted by review, create token-bearing `DESIGN.md` and `.impeccable/design.json` that describe the implemented Nocturne Hybrid system, component character, motion, responsive behavior, and surface modes.

- [ ] **Step 10: Record the final checkpoint if safe**

Review the complete scoped diff. Commit only isolated redesign hunks as `feat(ui): complete nocturne system redesign`; otherwise leave the preserved dirty worktree uncommitted and report exactly which verification commands passed.

## Self-Review Result

- Spec coverage: every public, auth, workspace, management, integration, utility, email, responsive, accessibility, i18n, review, and documentation requirement maps to a task.
- Step scan: each step owns one testable deliverable; behavioral logic is isolated in Task 2 with focused tests.
- Type consistency: shared component names and `getDashboardStatus` signatures are defined once and consumed by later tasks.
- Review focus: all five high-risk conditions have an owning task and explicit verification.
- Proportion: the plan locks decisions and checks without transcribing component implementations.
