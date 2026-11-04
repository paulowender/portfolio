# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is Wender and, as the operation grows, a small internal team responsible for Wender Tech's portfolio, client-facing presence, work reminders, schedule, and connected services. Public visitors are prospective clients and partners evaluating Wender Tech's work and deciding whether to make contact.

## Product Purpose

The product is Wender Tech's combined public portfolio and internal operations workspace. It lets the internal user maintain projects and company/profile content, track reminders and appointments, and configure operational integrations while publishing selected work through the public portfolio.

The immediate goal is to make the existing system feel coherent, trustworthy, and pleasant to use. The longer-term goal is to automate recurring activities in Wender's daily work and preserve a foundation that could later become a product for other professionals or small teams.

## Positioning

Unlike a generic portfolio template or a disconnected admin panel, the product joins the public proof of work with the private routines used to maintain that presence and run day-to-day work. The workspace should surface context, priorities, and next actions rather than merely expose database sections.

## Operating Context

- Public visitors browse Wender Tech's services, projects, company story, developer profile, and contact options.
- Internal users manage projects, personal and company profiles, reminders, calendar information, and integrations from a protected dashboard.
- Integrations currently include AI providers, messaging through Evolution, transactional email through Resend, and NFS-e homologation workflows.
- The interface supports Portuguese and English through the existing internationalization system.
- The product is used primarily on desktop for administration but must remain fully usable on mobile.

## Capabilities and Constraints

- Preserve the existing Next.js application, routes, content, authentication, data flows, permissions, APIs, and integrations.
- Preserve current public and private functionality during the visual redesign; workflow automation is a later project.
- Use the installed styling and interaction stack, including Tailwind CSS and Framer Motion, without introducing a new UI framework.
- Treat all user-facing areas as in scope: public portfolio, authentication and password recovery, dashboard and management screens, integration screens, system states, and transactional email templates.
- Do not fabricate testimonials, customers, performance claims, project outcomes, or product capabilities.
- Keep the architecture ready for future automation and potential multi-user productization without prematurely building those features.

## Brand Commitments

- Product and company name: Wender Tech.
- The approved visual direction is **Nocturne Hybrid**.
- The identity is dark, sophisticated, minimal, and product-like, using restrained violet rather than aggressive neon.
- A centered circular `W` is the compact product signature.
- Geometric navigation icons, useful contextual information, and plain operational language are preferred.
- The interface must avoid generic WordPress/template aesthetics, light editorial/newspaper styling, gamer styling, harsh green accents, decorative glow, and redundant labels such as calling an obvious dashboard a "command center".
- Approved contextual patterns include a breadcrumb such as "Workspace / Visão geral", the current date, and reassuring task-oriented language such as "Tudo sob controle" when the underlying state supports it.

## Evidence on Hand

- Existing portfolio, profile, company, project, reminder, and integration content is stored and rendered by the current application.
- Existing images and logos are under `public/`, including project/brand imagery and integration provider marks.
- Existing Portuguese and English product copy is under `messages/`.
- The approved visual prototype is `.superpowers/brainstorm/594454-1793731214/content/nocturne-hybrid-v2.html`.
- No new testimonials, customer logos, benchmarks, or commercial product claims have been supplied.

## Product Principles

1. Show context and priorities before navigation chrome.
2. Make daily work feel controlled, not administratively heavy.
3. Keep public expression and private operation in one recognizable visual world.
4. Preserve clarity and accessibility while giving the product a distinct point of view.
5. Build durable foundations for later automation without pretending those automations already exist.

## Accessibility & Inclusion

Maintain WCAG AA contrast, visible keyboard focus, semantic headings and landmarks, reduced-motion support, touch-friendly targets, and responsive layouts. Information must not depend on color alone. Both supported languages must tolerate realistic text expansion without clipping or loss of hierarchy.
