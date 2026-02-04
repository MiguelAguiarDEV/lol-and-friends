# Design System - Reto LoL

## Color Palette

### Theme Philosophy
The color palette is designed for:
- **Statistics**: Credible, data-focused colors (blues, purples)
- **League of Legends**: Brand colors (gold, cyan/teal)
- **Youth Audience (18-30)**: Vibrant, modern, high contrast
- **Accessibility**: WCAG AA compliant contrast ratios

### Color Tokens

#### Primary - LoL Gold
The iconic League of Legends gold color
- **HSL**: `42 65% 62%` (Dark mode) / `42 65% 52%` (Light mode)
- **Hex**: `#C8AA6E` (approximate)
- **Usage**: Main CTAs, important actions, highlights

#### Secondary - LoL Cyan/Teal
The energetic cyan from LoL branding
- **HSL**: `175 85% 55%` (Dark mode) / `175 70% 45%` (Light mode)
- **Hex**: `#0AC8B9` (approximate)
- **Usage**: Secondary actions, accents, energy indicators

#### Accent - Stats Purple
Purple for data visualization and statistics
- **HSL**: `262 80% 65%` (Dark mode) / `262 70% 55%` (Light mode)
- **Hex**: `#8B5CF6` (approximate)
- **Usage**: Charts, graphs, statistical highlights

#### Background - Dark Navy
Modern dark theme inspired by LoL client
- **HSL**: `220 20% 10%` (Dark mode) / `0 0% 100%` (Light mode)
- **Hex**: `#0F1923` (approximate dark)
- **Usage**: Main background

#### Semantic Colors

**Success**
- **HSL**: `142 76% 36%`
- **Hex**: `#22C55E`
- **Usage**: Wins, positive stats, completion

**Warning**
- **HSL**: `38 92% 50%`
- **Hex**: `#F59E0B`
- **Usage**: Alerts, cautions, neutral feedback

**Destructive**
- **HSL**: `0 72% 51%`
- **Hex**: `#EF4444`
- **Usage**: Losses, errors, danger

### Chart Colors
For statistics and data visualization:
1. Purple (`chart-1`): Main data series
2. Cyan (`chart-2`): Secondary series
3. Gold (`chart-3`): Tertiary series
4. Green (`chart-4`): Positive indicators
5. Red (`chart-5`): Negative indicators

## Component Usage

### Buttons
```tsx
<Button>Default (Gold)</Button>
<Button variant="secondary">Secondary (Cyan)</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive (Red)</Button>
```

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Badges
```tsx
<Badge>Default (Gold)</Badge>
<Badge variant="secondary">Secondary (Cyan)</Badge>
<Badge variant="success">Success (Green)</Badge>
<Badge variant="warning">Warning (Amber)</Badge>
<Badge variant="destructive">Destructive (Red)</Badge>
```

### Tables
Use the Table component for structured data display. Automatically styled with hover states and proper spacing.

## Typography

- **Font Family**: Geist Sans (primary), system fonts (fallback)
- **Letter Spacing**: `-0.011em` for tighter, modern feel
- **Headings**: Bold, clear hierarchy
- **Body**: Regular weight, comfortable reading

## Spacing

Following Tailwind's spacing scale with emphasis on:
- `gap-4`, `gap-6`, `gap-8` for content spacing
- `p-4`, `p-6` for card padding
- `px-4`, `py-2` for button padding

## Border Radius

- **Default**: `0.5rem` (rounded-md, rounded-lg)
- **Cards**: `rounded-lg`
- **Buttons**: `rounded-md`
- **Badges**: `rounded-full`

## Shadows

- **Cards**: `shadow-sm` with hover to `shadow-lg`
- **Primary shadow**: `shadow-primary/10` for gold glow effect

## Dark Mode

Default theme is dark mode (LoL client aesthetic). Light mode available for user preference.

To toggle (in your layout or component):
```tsx
<html className="dark"> // or remove for light mode
```

## Accessibility

All colors meet WCAG AA standards for contrast:
- Text on backgrounds: Minimum 4.5:1
- Large text: Minimum 3:1
- Interactive elements: Clear focus states

## Animation

Subtle transitions for professional feel:
- `transition-all` for hover states
- `transition-colors` for color changes
- Duration: Default Tailwind timings
