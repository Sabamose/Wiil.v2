# Adaptive Navigation System

A sophisticated navigation component that automatically adapts its behavior based on the current route and user interactions.

## Features

- **Smart Behavior**: Expanded on home page, collapsed icon strip on other pages
- **Hover Interaction**: Auto-expand on hover with 300ms collapse delay
- **Pin Control**: Toggle to keep navigation expanded (persists in localStorage)
- **Mobile Responsive**: Hamburger menu with slide-in drawer on mobile devices
- **Overlay Mode**: No layout shift on inner pages - navigation overlays content
- **Accessibility**: Full keyboard navigation, ARIA labels, focus management
- **Smooth Transitions**: 200ms animations that respect `prefers-reduced-motion`
- **Tooltips**: Icon labels shown on hover when collapsed

## Usage

Replace your existing Navigation component with `AdaptiveNavigation`:

```tsx
// In your layout or page components
import AdaptiveNavigation from '@/components/AdaptiveNavigation';

function Layout() {
  return (
    <>
      <AdaptiveNavigation />
      <main className={`${isHome ? 'ml-60' : 'ml-0'} mt-16`}>
        {/* Your page content */}
      </main>
    </>
  );
}
```

## Adding Navigation Items

Edit the `navigationItems` array in `AdaptiveNavigation.tsx`:

```tsx
const navigationItems = [
  {
    href: "/your-route",     // React Router path
    path: "/your-route",     // Path for active state matching
    icon: YourIcon,          // Lucide React icon component
    label: "Your Label"      // Display text and tooltip
  },
  // ... more items
];
```

## State Management

The navigation uses a custom hook `useNavigationState` that manages:

- `isCollapsed`: Whether the nav is in icon-only mode
- `isPinned`: Pin state (persisted in localStorage as 'navigation-pinned')
- `isMobile`: Mobile breakpoint detection (≤768px)
- `isHovered`: Hover state for auto-expand behavior
- `isHome`: Whether currently on home page (/)

## Pin State Persistence

The pin toggle state is automatically saved to localStorage and restored on page load. This allows users to maintain their preferred navigation state across sessions.

## Mobile Behavior

On mobile devices (≤768px):
- Icon strip is replaced with a hamburger menu
- Tapping opens a slide-in drawer from the left
- Auto-closes on navigation or Esc key
- Full-width content with no navigation overlay

## Accessibility Features

- Full keyboard navigation support
- Proper ARIA roles and labels
- Focus management and visible focus indicators
- Screen reader compatible tooltips
- Respects `prefers-reduced-motion` setting

## Layout Integration

### Home Page (/)
- Navigation always expanded
- Content has left margin to accommodate fixed navigation
- Pin control hidden (not needed)

### Inner Pages
- Navigation starts collapsed (unless pinned)
- Content renders full-width
- Navigation overlays content when expanded (no layout shift)
- Smooth hover interactions with debounced collapse

## Components

- `AdaptiveNavigation.tsx` - Main navigation component
- `useNavigationState.tsx` - State management hook
- `NavigationTooltip.tsx` - Reusable tooltip wrapper
- Uses existing UI components: Sheet, Button, Tooltip, Avatar

## Customization

The component uses semantic design tokens from your design system. Customize colors and spacing by updating your `index.css` and `tailwind.config.ts` files rather than modifying component styles directly.