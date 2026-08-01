---
name: PizzaNova Core
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1b1b'
  on-surface-variant: '#5a4136'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#a04100'
  primary: '#a04100'
  on-primary: '#ffffff'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#ffb693'
  secondary: '#b7131a'
  on-secondary: '#ffffff'
  secondary-container: '#db322f'
  on-secondary-container: '#fffbff'
  tertiary: '#006e2d'
  on-tertiary: '#ffffff'
  tertiary-container: '#2baf54'
  on-tertiary-container: '#003a15'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#fcf9f8'
  on-background: '#1b1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a high-velocity, tech-first delivery ecosystem. It avoids traditional "rustic" pizzeria tropes in favor of a **Corporate Modern** aesthetic influenced by high-growth SaaS platforms. The personality is energetic, efficient, and youthful. 

The visual language prioritizes speed and clarity through a **Modern Minimalist** approach: high-contrast typography, generous whitespace to reduce cognitive load during ordering, and tactile, rounded UI elements that feel approachable yet precise. The focus is on product photography and real-time data visualization rather than ornamental graphics.

## Colors
The palette is dominated by **International Orange (#FF6B00)**, chosen for its high visibility and appetite-stimulating properties. 

- **Primary & Secondary:** Use Orange for primary actions (Add to Cart, Track) and Red for urgency or secondary highlights (Deals, Spicy indicators).
- **Surface & Background:** Utilize the light gray-blue background to create a subtle contrast against the pure white surface cards. 
- **Success:** Use the green specifically for "Order Confirmed" states and "Available" stock indicators.
- **Text:** Use Dark Charcoal for all primary legibility; avoid pure black to maintain a premium SaaS feel.

## Typography
This design system utilizes a dual-font strategy to balance character with utility. 

- **Manrope** is used for headlines to provide a modern, technical, and slightly geometric personality. High-level headers should always use Bold or ExtraBold weights.
- **Inter** is used for all functional text, body copy, and UI labels. Its neutral, systematic nature ensures high legibility for menu item descriptions and complex admin data tables.
- **Hierarchy:** Maintain tight line heights for headlines to give a "compact" and energetic feel, while keeping body text line heights generous for readability.

## Layout & Spacing
The system follows an **8px grid** for consistent spatial relationships.

- **Grid System:** A 12-column fluid grid is used for desktop (breakpoints at 1280px, 1024px). For mobile, a single-column layout with 16px side margins is standard.
- **Admin Layouts:** For the management side, use a fixed left-hand sidebar (280px) and a fluid content area. 
- **Content Density:** Maintain generous internal padding within cards (24px) to ensure the UI feels "airy" and premium, avoiding the cluttered look of legacy food apps.

## Elevation & Depth
Depth is signaled through **Ambient Shadows** and tonal separation rather than heavy borders.

- **Level 1 (Surface):** Default state for cards. Use a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)).
- **Level 2 (Hover/Active):** When a user interacts with a menu card or button, the shadow should deepen and the element should "lift" (TranslateY: -4px) to provide immediate tactile feedback.
- **Level 3 (Modals/Floating Cart):** High elevation with a more pronounced shadow (0px 12px 32px rgba(0,0,0,0.12)) to indicate these elements sit atop the entire application flow.
- **Glassmorphism:** Use a subtle backdrop-blur (12px) on the sticky navigation bar and floating cart to maintain context of the content underneath.

## Shapes
The shape language is defined by **large, friendly corner radii**. 

- **Standard Elements:** Use `rounded-lg` (1rem) for standard product cards and input fields.
- **Pills/Buttons:** Primary buttons and category tags should use the `rounded-xl` or fully circular pill shape to emphasize the "youthful" and "fast" brand pillars.
- **Visual Consistency:** Avoid mixing sharp corners with rounded ones. Even "hard" elements like data tables in the admin dashboard should feature rounded outer containers.

## Components
- **Product Cards:** Must feature a high-resolution image top-aligned, 24px internal padding, and a prominent "Add" button in the bottom right using the primary orange.
- **Modern Search:** Search bars should be pill-shaped with a light gray background (#F1F3F5) and a soft-focus transition on click.
- **Badges & Chips:** Use secondary Red for "Bestseller" badges and tertiary Green for "Veg" indicators. Chips should have a light tinted background of the primary color with dark text.
- **Floating Cart:** A fixed-position element (bottom right on mobile, top right on desktop) with a background blur and high-elevation shadow.
- **Order Tracking Timeline:** A vertical or horizontal stepper using the primary orange for completed states and a pulse animation for the current active state.
- **Admin Data Tables:** Use Inter for all row data. Use "Zebra striping" with the background color (#F8F9FB) for rows to maintain legibility in dense management views.