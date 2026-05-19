---
name: Healthcare Accessibility System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-xl:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  stack-gap: 20px
  touch-target-min: 56px
---

## Brand & Style

The design system is centered on the core pillars of accessibility, clarity, and serenity. Designed specifically for an elderly demographic, the visual language prioritizes cognitive ease and physical comfort. The style is a refined **Modern Minimalism**, drawing inspiration from Apple’s clean aesthetic to foster a sense of professional reliability and calm.

Key characteristics include:
- **High Legibility:** Every element is sized for reduced visual acuity.
- **Low Cognitive Load:** Generous whitespace ensures that users can focus on one task at a time without distraction.
- **Physicality:** Large, "squishy" touch targets provide confidence in interaction, reducing the anxiety of accidental taps.
- **Trust-Centered:** A clean white base paired with soothing medical blues and greens evokes a professional clinical environment that feels safe rather than cold.

## Colors

The palette is optimized for high contrast and calming associations. 
- **Primary Blue (#3B82F6):** Used for primary actions and navigational cues, providing a sense of stability.
- **Secondary Green (#10B981):** Primarily used for "Taken" or "Success" states to reinforce positive health outcomes.
- **Soft Grays:** Used for subtle borders and secondary text to maintain hierarchy without cluttering the visual field.
- **Functional Semantics:** Red is reserved for missed medications or urgent alerts, while Amber is used for pending tasks, ensuring immediate recognition of priority levels.

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral, professional character. 

To accommodate elderly users, the typography scale begins at a larger baseline than standard applications. The minimum body size is 18px to ensure readability without strain. High weight contrast (using Semi-Bold for headings and Regular for body) helps guide the eye through the information hierarchy. Line heights are intentionally generous (1.5x) to prevent lines of text from blurring together for users with visual impairments.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to keep content centered and easily scannable, transitioning to a highly fluid single-column layout on mobile devices.

- **Generous Margins:** A minimum container padding of 32px ensures content never feels cramped.
- **Vertical Rhythm:** A consistent 8px base unit is used, with a preference for larger gaps (20px+) between logical sections to clearly delineate different medical records or schedules.
- **Safe Areas:** All interactive elements maintain a minimum hit area of 56px to account for reduced motor precision.

## Elevation & Depth

The system uses **Tonal Layering** combined with **Ambient Shadows** to create a soft, approachable sense of depth.

- **Level 0 (Background):** Pure white (#FFFFFF) for maximum contrast with text.
- **Level 1 (Cards/Containers):** Subtle off-white or very light gray surfaces with a soft, diffused shadow (15% opacity, 20px blur) to make medication cards "pop" from the background.
- **Level 2 (Interactive/Overlays):** Slightly more pronounced shadows to indicate that an element, such as a modal or a primary action button, is sitting above the main interface and is ready for interaction.
- **Glassmorphism:** Reserved exclusively for sticky navigation bars to maintain context of the scroll position while providing a modern, clean feel.

## Shapes

The shape language is defined by **Pill-shaped** and large-radius containers. This "friendly" geometry removes the perceived "sharpness" of medical software, making the app feel more like a lifestyle companion.

- **Standard Elements:** 16px (1rem) radius.
- **Large Cards & Inputs:** 24px to 32px radius.
- **Action Buttons:** Fully rounded (pill) ends to clearly distinguish them from informational cards.

## Components

### Buttons
Primary buttons are high-contrast (Blue background, White text), spanning the full width of their container on mobile to ensure ease of tap. Secondary buttons use a thick 2px stroke.

### Input Fields
Inputs are oversized (minimum 64px height) with a 20px font size. Labels are always persistent above the field—never placeholder-only—to assist users who may forget what they are typing.

### Medication Cards
The most prominent component. These cards feature:
- Large-scale icons for pill types.
- Clear, bold time-stamps.
- High-contrast status badges.

### Status Indicators
Status indicators use both color and icons for accessibility (Double-encoding):
- **Taken:** Green background with a checkmark.
- **Missed:** Red background with an 'X'.
- **Pending:** Amber background with a clock icon.

### Lists
List items feature increased vertical padding and "chevron-right" indicators to clearly signal drill-down interactions. Dividers are soft gray and full-width to prevent visual fragmentation.