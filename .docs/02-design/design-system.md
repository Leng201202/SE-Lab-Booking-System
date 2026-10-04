# Design system

Source: the actual shipped CSS and components (`app/src/index.css`,
`app/src/components/ui/*.jsx`) — not a mockup screenshot. Every token and rule below is a real
value already in production code, with its file reference, so this document cannot drift
silently from what ships.

## Tokens

### Color

Defined as a Tailwind v4 `@theme` block in [app/src/index.css](../../app/src/index.css).

| Token | Value | Used for |
|---|---|---|
| `--color-mfu-50` … `--color-mfu-950` | `#effaf3` → `#042619` (11-step green scale) | Primary brand color — buttons, focus rings, links, Dean/Advisor workspace header gradient |
| `--color-adt-blue` | `#2948bf` | Brand stripe (School of Applied Digital Technology identity bar) |
| `--color-adt-yellow` | `#f2df27` | Brand stripe |
| `--color-adt-red` | `#e43b35` | Brand stripe |
| `--font-sans` | `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | All text |

The brand stripe (`.brand-stripe` in index.css) is a fixed 4-color gradient — red 0–25%,
yellow 25–50%, blue 50–75%, mfu-500 green 75–100% — used as a thin top border on key panels to
carry the university/department identity.

### Spacing & sizing

Observed directly from component classes (not a separate token file — Tailwind's default scale
is used directly):

| Use | Value | Where |
|---|---|---|
| Button height, `sm` | `h-10` (40px) | [Button.jsx](../../app/src/components/ui/Button.jsx) |
| Button height, `md` (default) | `h-11` (44px) | Button.jsx |
| Button height, `lg` | `h-12` (48px) | Button.jsx |
| Input/select height | `h-11` (44px) | [FormFields.jsx](../../app/src/components/ui/FormFields.jsx) |
| Button horizontal padding | `px-3` (sm) / `px-4` (md) / `px-5` (lg) | Button.jsx |
| Input horizontal padding | `px-3.5` | FormFields.jsx |

### Radius

| Token | Value | Used for |
|---|---|---|
| `rounded-xl` | 12px | Buttons, inputs, badges, small icon tiles |
| `rounded-2xl` | 16px | Cards, modals |
| `rounded-t-2xl` | 16px (top only) | Mobile bottom-sheet modal |

### Breakpoints

Mobile-first throughout; the only breakpoint actually used in components is Tailwind's default
`sm:` (640px) — e.g. Modal.jsx renders as a full-width bottom sheet below 640px and a centered
`max-w-md` dialog at `sm:` and above.

## Component rules

Written as commands, each checked against what the code actually does:

1. **Touch targets must be ≥44px.** The `md` (44px) and `lg` (48px) Button sizes, and the
   44px Input/Select height, satisfy this. **Known gap:** the `sm` Button size is `h-10`
   (40px) — below 44px. It is currently used in a few dense admin tables
   (e.g. [UserManagementPage.jsx](../../app/src/features/users/UserManagementPage.jsx)). This
   is a real, open inconsistency — do not silently "fix" it by resizing without checking
   whether it also needs a layout change in those tables; raise it as a design decision instead.
2. **Never hardcode a hex value in component code.** Colors are referenced through Tailwind
   utility classes tied to the `@theme` tokens (`bg-mfu-700`, `text-mfu-900`, etc.), not literal
   `#rrggbb` strings. The three ADT brand colors are the only hex-like values, and they are
   defined once, centrally, in `index.css` — not repeated at point of use.
3. **Mobile-first, with one `sm:` breakpoint for web.** Build the single-column/mobile layout
   first; add `sm:` utility variants only where the desktop/tablet layout genuinely differs
   (see Modal.jsx's bottom-sheet → centered-dialog pattern above).
4. **Focus must be visible and consistent with the element's own pattern.** Buttons use
   `focus-visible:outline-2 outline-offset-2 outline-mfu-600`; text inputs/selects use
   `focus:border-mfu-500 focus:ring-3 ring-mfu-100` instead. These are two different real
   patterns already in use — match whichever one the element type already uses rather than
   inventing a third.
5. **Cards get `rounded-2xl`; everything interactive inside them gets `rounded-xl`.** This
   nested-radius relationship is consistent across every screen already built — preserve it
   for new components rather than picking an arbitrary radius.
