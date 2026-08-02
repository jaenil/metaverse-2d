# Frontend Engineering Rules

> These rules are mandatory for every frontend implementation task. If any instruction conflicts with assumptions made by the model, these rules take precedence.

---

# Primary Objective

The primary objective is to faithfully reproduce the provided design.

The implementation should prioritize:

- Visual accuracy
- Component reusability
- Responsive behaviour
- Clean architecture
- Maintainability

Do **not** redesign any part of the interface.

Do **not** "improve" the design.

Do **not** invent spacing, colors, layouts, or animations that are not present in the reference.

Whenever something is ambiguous, choose the implementation that most closely resembles the supplied design.

---

# Technology Stack

The project stack is fixed.

- React
- TypeScript
- Vite
- Tailwind CSS

Do not introduce:

- Material UI
- Chakra UI
- Bootstrap
- Ant Design
- Styled Components
- Emotion
- CSS Modules

unless explicitly instructed.

Use Tailwind CSS for all styling.

Avoid inline CSS except when absolutely unavoidable.

---

# General Development Philosophy

Every implementation should prioritize:

1. Readability
2. Reusability
3. Maintainability
4. Responsiveness
5. Minimal duplication

Always think in terms of reusable UI building blocks instead of isolated pages.

---

# Component Design Rules

Create reusable components whenever repetition exists.

Examples include:

- Button
- Input
- TextArea
- Label
- Select
- Card
- Badge
- Avatar
- Modal
- Navbar
- Sidebar
- Header
- Footer
- Dialog
- Loading Spinner
- Empty State
- Form Section

Avoid duplicated JSX.

Prefer composition over duplication.

Props should remain simple and intuitive.

Do not over-engineer components.

---

# Folder Organization

Keep the folder structure organized.

Example:

src/

components/

pages/

layouts/

hooks/

lib/

services/

types/

assets/

Do not create unnecessary folders.

---

# Styling Rules

Use Tailwind utility classes.

Prefer Flexbox or CSS Grid.

Maintain consistent spacing throughout the project.

Avoid arbitrary Tailwind values whenever a standard utility exists.

Use arbitrary values only when necessary to accurately match the design.

Never mix multiple styling approaches.

---

# Responsive Design Requirements

Every page must be responsive.

Support at least:

- Mobile
- Tablet
- Laptop
- Desktop
- Ultrawide

Use Tailwind responsive modifiers.

Examples:

sm:

md:

lg:

xl:

2xl:

Requirements:

- No horizontal scrolling
- No clipped elements
- No overflowing cards
- No overflowing text
- Images scale naturally
- Forms remain usable
- Navigation remains accessible
- Buttons remain tappable on mobile

Avoid fixed widths whenever responsive alternatives exist.

Prefer:

- w-full
- max-w-*
- min-h-screen
- flex-wrap
- overflow-auto

instead of rigid layouts.

---
# Screen Utilization & Visual Scale

The implementation must preserve not only the layout but also the overall visual scale of the supplied design.

A common failure mode is shrinking the entire interface into a small centered container. This is strictly prohibited unless the reference design itself uses such a layout.

## Overall Screen Usage

The page should occupy an appropriate amount of the viewport.

Prefer layouts that make effective use of available screen space while preserving the proportions shown in the reference.

Avoid excessive empty margins around the primary content.

The main content should visually fill the viewport in a way that matches the supplied design.

## Component Dimensions

Maintain the relative dimensions visible in the reference.

This includes:

- form width
- card width
- card height
- button size
- input height
- image size
- icon size
- section spacing

Do not arbitrarily reduce the size of major UI elements.

If a login form occupies approximately 40–50% of the desktop viewport in the design, implement it at a comparable scale rather than compressing it into a narrow column.

## Relative Proportions

Preserve the visual proportions between elements.

Examples:

- headings should not appear disproportionately small
- buttons should not be significantly smaller than inputs
- cards should maintain similar aspect ratios
- side panels should preserve their intended width
- illustrations should retain their intended visual prominence

Scale the interface uniformly rather than shrinking individual components independently.

## Container Width Rules

Avoid unnecessarily restrictive containers.

Do not default to:

- max-w-sm
- max-w-md
- max-w-lg

unless these dimensions clearly match the reference.

Choose container widths based on the supplied design rather than framework defaults.

Use wider containers whenever the reference indicates a larger layout.

## Full Height Layouts

When the design spans the viewport, prefer:

- min-h-screen
- h-screen (when appropriate)

Content should remain vertically balanced without appearing compressed.

Avoid large unused regions above or below the primary content.

## Responsive Scaling

As screen size increases:

- containers may grow
- spacing may increase proportionally
- typography may scale appropriately
- images may scale appropriately

Do not keep desktop layouts artificially narrow simply because they also support mobile.

Large displays should present a proportionally larger interface instead of a small centered version surrounded by whitespace.

## Visual Density

Match the density of the supplied design.

Avoid:

- oversized margins
- oversized gaps
- tiny forms
- tiny cards
- tiny dialogs
- excessive whitespace

The implementation should feel visually balanced and occupy space similarly to the reference.

## Matching the Reference

Treat dimensions as part of the design.

When comparing the implementation against the supplied image, evaluate:

- overall occupied screen area
- component proportions
- whitespace distribution
- balance between left and right sections
- relative sizing of all major elements

If the implementation appears noticeably smaller than the reference, adjust dimensions before considering the task complete.

A visually compressed implementation should be treated as incorrect even if the layout structure is otherwise accurate.
# Layout Rules

Preserve the supplied layout.

Do not:

- Move components
- Rearrange sections
- Add whitespace
- Remove whitespace
- Add decorative elements

unless explicitly instructed.

---

# Typography Rules

Preserve typography hierarchy.

Do not invent fonts.

Use the project's configured fonts.

Maintain consistent:

- font sizes
- font weights
- line heights
- spacing

Avoid unnecessary bold text.

---

# Color Rules

Preserve colors from the reference.

Never:

- Replace colors
- Change shades
- Add gradients
- Add transparency
- Change opacity

unless shown in the design.

---

# Border Radius

Use the radius visible in the design.

Do not increase or decrease border radius arbitrarily.

---

# Shadows

Only add shadows when shown.

Avoid decorative shadows.

---

# Icons

Use lucide-react unless another icon library already exists in the project.

Never replace icons with emojis.

Maintain consistent icon sizing.

---

# Images

Reuse provided assets.

Maintain aspect ratios.

Never stretch images.

Use:

object-cover

or

object-contain

where appropriate.

---

# Forms

Every form should have:

- Labels
- Placeholders where appropriate
- Keyboard accessibility
- Logical tab ordering

Inputs should remain consistent across the project.

---

# Accessibility

Ensure:

- Semantic HTML
- Keyboard navigation
- Accessible buttons
- Accessible forms
- Proper heading hierarchy

---

# Code Quality

Use:

- Functional components
- TypeScript
- Clean imports
- Reusable hooks when necessary

Avoid:

- Deep nesting
- Repeated logic
- Unused state
- Dead code

---

# Performance

Avoid unnecessary renders.

Avoid unnecessary state.

Memoize only when beneficial.

Do not optimize prematurely.

---

# Routing

Do not modify routing unless explicitly requested.

Do not create routes unrelated to the task.

---

# Change Isolation

Every task must modify only the files required for that task.

Previously completed pages are considered **frozen**.

Do not modify previously completed pages unless explicitly instructed.

Do not:

- Refactor unrelated code
- Rename files
- Rename folders
- Rename components
- Change existing APIs
- Reformat the project
- Reorder imports unless required
- Touch unrelated files

If a modification to an existing file is unavoidable, explain why before making the change.

---

# Forbidden Actions

Never:

- Redesign the UI
- Improve the design
- Invent animations
- Invent spacing
- Change colors
- Modify completed pages
- Introduce unrelated refactoring
- Install packages without permission
- Change project configuration
- Replace existing components
- Rewrite working code unnecessarily

Stay strictly within the requested scope.

---

# Implementation Workflow

Every frontend task must be completed using the following three-pass workflow.

Never skip any pass.

---

## PASS 1 — Architecture

Read and understand the provided design and implementation details.

Identify:

- Page structure
- Layout hierarchy
- Shared components
- Routing requirements
- State requirements
- Reusable UI elements

During this phase:

- Build the component hierarchy.
- Create reusable components.
- Organize folders if necessary.
- Implement state and props.
- Implement routing if explicitly requested.

Do **not** spend time polishing styling.

Focus entirely on building a clean, maintainable structure.

---

## PASS 2 — Styling

Once architecture is complete:

Apply Tailwind styling.

Implement:

- Layout
- Spacing
- Typography
- Colors
- Borders
- Shadows
- Hover states
- Focus states
- Responsive behaviour

During this phase:

- Do not modify the component hierarchy.
- Do not introduce new components.
- Only adjust styling through Tailwind classes.

The goal is to match the provided design as closely as possible.

---

## PASS 3 — Self Review

Before considering the task complete, perform a complete internal review.

Verify all of the following:

### Layout

- No overflow
- No clipping
- Correct alignment
- Correct spacing
- Consistent padding
- Consistent margins

### Responsiveness

- Mobile layout works
- Tablet layout works
- Desktop layout works
- No horizontal scrolling
- Images scale correctly
- Cards resize correctly

### Styling

- Colors match the design
- Typography hierarchy is correct
- Border radius is consistent
- Shadows are correct
- Icons are aligned
- Buttons are consistent

### Code Quality

- No duplicated JSX
- Reusable components extracted
- No unused imports
- No unused variables
- No dead code
- No TODO comments

### Dimension Verification

Verify the implementation against the reference for:

- overall occupied screen area
- container widths
- component heights
- relative proportions
- visual density
- whitespace distribution

Ensure the interface does not appear compressed or undersized.

If the implementation occupies substantially less screen space than the reference, revise dimensions before completing the task.

### TypeScript

- No type errors
- Proper interfaces
- Proper prop types

### Accessibility

- Semantic HTML
- Labels for inputs
- Keyboard accessibility
- Proper heading hierarchy

### Final Verification

Ensure:

✓ Responsive layout

✓ No overflow

✓ No duplicated components

✓ Clean component hierarchy

✓ Tailwind-only styling

✓ No TypeScript errors

✓ No unused imports

✓ No broken routing

✓ No unnecessary packages

✓ No unrelated file modifications

If any issue is discovered during this review, fix it before completing the task.

Do not stop after the first implementation.

The implementation is considered complete only after all verification checks pass.

---

# Expected Behaviour

For every frontend task, follow this sequence internally:

1. Understand the supplied page specification.
2. Design the component architecture.
3. Implement the architecture.
4. Apply styling.
5. Make the page responsive.
6. Perform a complete internal verification.
7. Fix all discovered issues.
8. Return only the final implementation.

Do not expose intermediate reasoning or partial implementations unless explicitly requested.

---

# Scope Discipline

Unless explicitly instructed otherwise:

- Implement only the requested page or feature.
- Do not modify unrelated pages.
- Do not perform repository-wide refactors.
- Do not introduce new dependencies.
- Do not change project configuration.
- Preserve the existing project architecture.
- Treat completed pages as immutable.

The objective is to produce a frontend that is visually accurate, maintainable, responsive, and free of unintended side effects.