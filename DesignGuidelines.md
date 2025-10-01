# O.R.B.I.T.E.R. Design System
**On-chain Registry & Brokerage Infrastructure for Tokenized External Resources**

---

## 🎨 Visual Language

### Core Concept
O.R.B.I.T.E.R. is your command center for tokenized assets on the blockchain. Our design language draws inspiration from NASA mission control rooms, orbital mechanics, and aerospace engineering. Every element should feel purposeful, data-driven, and technically precise—like tools built for space exploration and resource management.

The acronym itself guides our metaphor: assets are resources in orbit, the platform is the infrastructure that tracks and brokers them, and users are operators managing their tokenized portfolio.

### Key Principles
- **Clarity Over Decoration**: Information density without clutter
- **Engineered Precision**: Clean lines, geometric shapes, technical accuracy
- **Data Visualization First**: Charts, trajectories, and metrics take center stage
- **Functional Motion**: Every animation serves a purpose

---

## 🌌 Color Palette: Solar Flare

### Core Concept
The Solar Flare theme evokes the focused, high-alert atmosphere of a mission control center during critical operations. Drawing inspiration from the intense energy of a star, this palette is professional, data-forward, and commands attention without relying on traditional blues. Every color choice reinforces the feeling of monitoring powerful systems and managing high-stakes operations.

### Primary Colors

**Void Black** `#111111`
- **Use for**: Main backgrounds, dark surfaces, app chrome
- **Purpose**: A deep, rich off-black that's less harsh than pure black, making dense data easier to read during extended monitoring sessions
- **Application**: Canvas backgrounds, card backgrounds, modal overlays

**Stark White** `#E8E8E8`
- **Use for**: Primary body text, data points, labels, icons
- **Purpose**: Clean, slightly soft white ensuring maximum clarity without eye strain
- **Application**: All readable text, numerical displays, form inputs, navigation text

**Ignition Orange** `#FF7A00`
- **Use for**: Primary CTAs, active states, highlights, critical alerts
- **Purpose**: Powerful, energetic orange that commands attention like launch ignition
- **Application**: Primary buttons, active navigation items, selected states, important notifications, progress indicators

**Solar Yellow** `#FFC700`
- **Use for**: Secondary accents, chart highlights, warnings, success states
- **Purpose**: Vibrant, warm yellow for elements that need to stand out from primary orange
- **Application**: Warning badges, chart data points, secondary buttons, hover states, tooltips, success confirmations

**Charred Steel** `#3D2D1D`
- **Use for**: Containers, borders, inactive elements, subtle dividers
- **Purpose**: Subtle dark brown/orange adding depth without visual noise
- **Application**: Card borders, disabled buttons, input borders, section dividers, inactive tabs

### Extended Palette

**Derived Shades (for depth and hierarchy)**

*Ignition Orange Variants*
- Light: `#FF9533` (Hover states, lighter accents)
- Dark: `#CC6200` (Pressed states, shadows)
- Subtle: `#4D2600` (Backgrounds with orange tint)
- Glow: `#FF7A0040` (Transparent glow effects, 25% opacity)

*Solar Yellow Variants*
- Light: `#FFD633` (Bright highlights)
- Dark: `#CCA000` (Darker warnings)
- Subtle: `#4D3D00` (Yellow-tinted backgrounds)
- Glow: `#FFC70040` (Transparent glow effects, 25% opacity)

*Gray Scale (from Void Black to Stark White)*
- Gray 900: `#1A1A1A` (Elevated surfaces)
- Gray 800: `#262626` (Hover backgrounds)
- Gray 700: `#404040` (Border emphasis)
- Gray 600: `#595959` (Disabled text)
- Gray 500: `#737373` (Secondary text)
- Gray 400: `#A6A6A6` (Tertiary text, placeholders)
- Gray 300: `#BFBFBF` (Light borders)

### Color Application Guidelines

**Backgrounds**
- Primary: Void Black `#111111`
- Elevated: Gray 900 `#1A1A1A`
- Hover: Gray 800 `#262626`
- Containers: Charred Steel `#3D2D1D`

**Text**
- Primary: Stark White `#E8E8E8`
- Secondary: Gray 500 `#737373`
- Tertiary: Gray 400 `#A6A6A6`
- Disabled: Gray 600 `#595959`

**Actions & States**
- Primary Action: Ignition Orange `#FF7A00`
- Secondary Action: Solar Yellow `#FFC700`
- Danger/Critical: Ignition Orange `#FF7A00` with pulse
- Warning: Solar Yellow `#FFC700`
- Success: Solar Yellow `#FFC700` with checkmark
- Info: Stark White `#E8E8E8` with border

**Borders & Dividers**
- Default: Charred Steel `#3D2D1D`
- Emphasis: Gray 700 `#404040`
- Active: Ignition Orange `#FF7A00`
- Focus: Ignition Orange `#FF7A00` with glow

**Data Visualization**
Use a spectrum that complements the Solar Flare theme:
1. Ignition Orange `#FF7A00` (Primary metric)
2. Solar Yellow `#FFC700` (Secondary metric)
3. Gray 400 `#A6A6A6` (Tertiary metric)
4. Charred Steel `#3D2D1D` (Background bars)
5. Stark White `#E8E8E8` (Labels, axes)

---

## 📐 Visual Components

### Orbital Trajectory Maps
- Use curved, dotted paths to show asset transfer flows and transaction routes
- Implement gentle arc animations for data transfers between registry points
- Display nodes as orbital bodies (tokenized resources) with glow effects
- Central hub represents the O.R.B.I.T.E.R. registry core

### Radar Screens
- Circular, grid-based layouts for real-time asset monitoring
- Sweeping scan lines for discovering available resources
- Blip animations for new token registrations or transactions
- Range rings to show asset categories or value tiers

### Data-Heavy Displays
- Monospaced numbers for precision
- Grid-aligned layouts
- Status indicators with color coding
- Real-time updating metrics

### Mission Control Panels
- Modular card-based layouts displaying asset registries and brokerage data
- Technical borders and dividers using Charred Steel
- Embedded mini-visualizations for real-time metrics
- System status indicators in corners
- Header sections with Space Grotesk titles
- Data grids with IBM Plex Mono for precision

---

## ✨ Animation Library

### Loading States

**Satellite Orbit Spinner**
```
Animation: Ignition Orange satellite icon orbits around either:
  - O.R.B.I.T.E.R. logo, or
  - Solar Yellow central dot
Duration: 1.5s continuous rotation
Path: Elliptical orbit (not perfect circle)
Easing: Linear (consistent orbital motion)
Scale: Center stays fixed, satellite follows path
Trail effect: Optional fading orange trail
```

**Radar Sweep**
```
Base: Circular grid with Charred Steel lines
Sweep: Ignition Orange gradient sweep from 0° to 360°
Duration: 2s
Easing: ease-in-out
Blips: Solar Yellow dots appear when sweep passes
Use for: Search operations, asset discovery, network scanning
```

**Data Stream**
```
Path: Curved lines in Charred Steel
Dots: Alternating Ignition Orange and Solar Yellow
Animation: Flow along paths continuously
Duration: 1s per cycle
Speed: Faster dots for active transfers, slower for pending
Use for: Transfer operations, syncing, data flow visualization
```

### Success States

**Rocket Launch**
```
Rocket: Small icon in Stark White outline
Flame: Ignition Orange to Solar Yellow gradient
Animation sequence:
  1. Pre-launch rumble (0.1s) - slight shake
  2. Ignition flash (0.1s) - bright Solar Yellow burst
  3. Lift-off (0.4s) - rocket rises with Ignition Orange trail
  4. Fade out (0.3s) - exits "atmosphere" with trail dissipating
Total duration: 0.9s
Trigger: On successful transaction confirmation, registry completion
Sound: Optional whoosh/ignition sound effect
```

**Orbital Achievement**
```
Ring: Starts as Ignition Orange circle
Animation: Expands outward while fading
Secondary ring: Solar Yellow, slightly delayed
Duration: 0.8s total (staggered by 0.2s)
Use for: Milestone completions, successful registrations
Center: Optional checkmark or success icon in Solar Yellow
```

### Transition Effects

**Panel Slide-In**
```
From: translateX(-20px), opacity: 0
To: translateX(0), opacity: 1
Duration: 0.3s
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

**Metric Count-Up**
```
Numbers increment smoothly to final value
Duration: 0.8s
Easing: ease-out
Format: Maintain decimal precision
```

**Status Change**
```
Color transition with subtle pulse
From: Current state color
To: New state color
Duration: 0.4s
Pulse: 1px outline glow effect in new color
Easing: ease-in-out
Example: Pending (Gray) → Active (Ignition Orange) with orange glow pulse
```

**Alert/Notification Entry**
```
From: translateX(100%), opacity: 0 (slides from right)
To: translateX(0), opacity: 1
Duration: 0.4s
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Border: 2px left border in Ignition Orange or Solar Yellow
Background: Gray 900 (#1A1A1A)
Icon: Animated pulse on entry
```

---

## ✒️ Typography System

### Font Stack

**Headings & Display Text**
```css
font-family: 'Space Grotesk', system-ui, sans-serif;
```
**Purpose**: Distinct, geometric, and slightly wide structure that feels engineered and futuristic without being cliché  
**Use for**: H1-H6, card titles, feature labels, call-to-action buttons, key metrics, control panel headers

**Body Text & UI Elements**
```css
font-family: 'IBM Plex Sans', system-ui, sans-serif;
```
**Purpose**: Neutral yet technical feel, designed by IBM for clarity in complex user interfaces  
**Use for**: Paragraphs, descriptions, form labels, navigation items, button text, tooltips, help text

**Monospace & Technical Data**
```css
font-family: 'IBM Plex Mono', 'Courier New', monospace;
```
**Purpose**: Monospaced version from the IBM Plex family creates perfect visual harmony with IBM Plex Sans  
**Use for**: Wallet addresses, transaction hashes, numerical data, tabular information, code snippets, timestamps, any "terminal" style information

### Why This Pairing Works
The combination of **Space Grotesk** for impact, **IBM Plex Sans** for readability, and **IBM Plex Mono** for data creates a cohesive technical aesthetic. The IBM Plex family's shared DNA ensures visual harmony, while Space Grotesk provides distinctive personality for headings.

### Type Scale

```
H1: 3.5rem (56px) - Space Grotesk Bold - Line height: 1.1
H2: 2.5rem (40px) - Space Grotesk Bold - Line height: 1.2
H3: 2rem (32px) - Space Grotesk SemiBold - Line height: 1.25
H4: 1.5rem (24px) - Space Grotesk SemiBold - Line height: 1.33
H5: 1.25rem (20px) - Space Grotesk Medium - Line height: 1.4
H6: 1rem (16px) - Space Grotesk Medium - Line height: 1.5

Body Large: 1.125rem (18px) - IBM Plex Sans Regular - Line height: 1.6
Body: 1rem (16px) - IBM Plex Sans Regular - Line height: 1.6
Body Small: 0.875rem (14px) - IBM Plex Sans Regular - Line height: 1.5
Caption: 0.75rem (12px) - IBM Plex Sans Regular - Line height: 1.4

Data Display: 1rem (16px) - IBM Plex Mono Regular - Line height: 1.5
Code: 0.875rem (14px) - IBM Plex Mono Regular - Line height: 1.5
```

### Font Weights

**Space Grotesk**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
**IBM Plex Sans**: 400 (Regular), 500 (Medium), 600 (SemiBold)
**IBM Plex Mono**: 400 (Regular), 500 (Medium)

### Typography Guidelines

- **Headings**: Always use Space Grotesk for maximum impact and technical feel
- **Metrics & Data**: Use IBM Plex Mono for any numerical values, addresses, or technical identifiers
- **Descriptions**: IBM Plex Sans provides excellent readability for longer text
- **Letter Spacing**: 
  - Headings: -0.02em for tighter, more technical feel
  - Body: Default (0)
  - All Caps Labels: +0.05em for improved readability

---

## 🎯 Component Patterns

### Cards
- Background: Gray 900 (#1A1A1A) for elevation above Void Black
- Border: 1px Charred Steel (#3D2D1D)
- Optional glow effect on hover using Ignition Orange glow (#FF7A0040)
- Header with icon (Ignition Orange) + label (Space Grotesk)
- Data section with monospaced numbers (IBM Plex Mono, Stark White)
- Status indicator in top-right corner
- Padding: 24px
- Border radius: 8px
- Hover: Lift effect (translateY(-2px)) + shadow increase

### Buttons

**Primary (Ignition Action)**
```
Background: Ignition Orange (#FF7A00)
Text: Void Black (#111111) for maximum contrast
Font: Space Grotesk SemiBold
Hover: Lighter orange (#FF9533) + subtle glow effect
Active: Darker orange (#CC6200)
Icon: Right-aligned arrow or rocket icon
Border: None
Shadow: 0 0 20px rgba(255, 122, 0, 0.3)
```

**Secondary (Solar Action)**
```
Background: Transparent
Border: 2px Solar Yellow (#FFC700)
Text: Solar Yellow (#FFC700)
Font: Space Grotesk Medium
Hover: Filled background Solar Yellow, text Void Black
Active: Darker yellow (#CCA000)
Icon: Optional left or right aligned
```

**Tertiary (Subtle Action)**
```
Background: Transparent
Border: 1px Charred Steel (#3D2D1D)
Text: Stark White (#E8E8E8)
Font: Space Grotesk Regular
Hover: Background Gray 800 (#262626)
Active: Border Ignition Orange
```

**Danger (Critical Action)**
```
Background: Ignition Orange (#FF7A00)
Border: 2px darker orange (#CC6200)
Text: Void Black (#111111)
Font: Space Grotesk SemiBold
Hover: Pulse animation + brighter glow
Icon: Warning or alert icon
```

### Status Badges
- Pill-shaped with subtle glow using color-specific transparency
- Icon + label combination using IBM Plex Sans
- Color-coded by state:
  - **Active**: Ignition Orange (#FF7A00) background, Void Black text
  - **Success**: Solar Yellow (#FFC700) background, Void Black text
  - **Warning**: Solar Yellow (#FFC700) border, Solar Yellow text
  - **Error**: Ignition Orange (#FF7A00) border with pulse, Ignition Orange text
  - **Pending**: Charred Steel (#3D2D1D) background, Gray 500 text
  - **Inactive**: Gray 800 background, Gray 400 text

### Data Tables
- Background: Void Black (#111111)
- Header background: Gray 900 (#1A1A1A)
- Header text: Space Grotesk Medium, Stark White
- Row background (odd): Void Black
- Row background (even): Gray 900 (#1A1A1A) for subtle alternation
- IBM Plex Mono for numerical columns
- IBM Plex Sans for text columns
- Border: 1px Charred Steel (#3D2D1D) between rows
- Hover: Gray 800 (#262626) background + 1px Ignition Orange left border
- Sortable headers with arrow indicators (Solar Yellow when active)
- Selected row: Ignition Orange glow (#FF7A0040) background

---

## 🚀 Implementation Notes

### Performance
- Use CSS transforms for animations (GPU accelerated)
- Lazy load trajectory calculations
- Optimize SVG assets for orbital graphics
- Implement skeleton loading states

### Accessibility
- Maintain 4.5:1 contrast ratio minimum (Stark White on Void Black exceeds this)
- Ignition Orange on Void Black: ~8.5:1 ratio ✓
- Solar Yellow on Void Black: ~12:1 ratio ✓
- Provide text alternatives for all animations
- Include reduced-motion media queries for users with vestibular disorders
- Keyboard navigation for all interactive elements with visible focus states (Ignition Orange outline)
- Screen reader announcements for dynamic content updates
- Never rely on color alone—always pair with icons or text labels

### Responsive Behavior
- Scale trajectory maps proportionally
- Stack data panels vertically on mobile
- Reduce animation complexity on smaller devices
- Maintain monospace alignment across breakpoints

---

## 📦 Design Assets

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Icon Set
Use outline-style icons from Lucide React or Heroicons for consistency with the technical aesthetic. Primary icon color should be Stark White, with Ignition Orange for active/selected states and Solar Yellow for warnings or highlights.

**Recommended Icon Categories:**
- Navigation: Satellite, radar, orbit, telescope
- Actions: Rocket (launch), plus-circle (add), arrow-right (proceed)
- Status: Check-circle (success), alert-triangle (warning), x-circle (error)
- Data: Bar-chart, line-chart, activity, trending-up
- System: Settings, terminal, database, server

### Illustrations
- Simplified orbital diagrams in Ignition Orange and Solar Yellow on Void Black
- Isometric satellite illustrations with Charred Steel shadows
- Abstract network visualizations using the Solar Flare palette
- Minimalist rocket/spacecraft vectors in outline style
- Data flow diagrams with curved paths and glowing nodes

---

## 🎓 Best Practices

### Do's ✅
- Use precise, technical language that reinforces the command center aesthetic
- Show real-time data updates with smooth transitions
- Implement subtle, purposeful animations that enhance understanding
- Maintain consistent spacing and alignment across all components
- Leverage IBM Plex Mono for all data that requires precision (addresses, hashes, numbers)
- Use Ignition Orange sparingly for maximum impact on primary actions
- Ensure Charred Steel provides subtle depth without competing with content
- Always pair Solar Yellow and Ignition Orange thoughtfully—never let them clash

### Don'ts ❌
- Avoid cartoonish or playful illustrations—maintain professional tone
- Don't use excessive gradients or blur effects
- Skip decorative animations that don't serve a functional purpose
- Never compromise data readability for aesthetics
- Avoid using more than 2 accent colors (Ignition Orange + Solar Yellow) in one view
- Don't use blue—it conflicts with the Solar Flare theme identity
- Never use pure black (#000000)—always use Void Black (#111111)
- Don't mix orange/yellow for the same type of action—maintain clear hierarchy

---

**Version**: 1.0  
**Last Updated**: Mission Day 001  
**Project**: O.R.B.I.T.E.R. (On-chain Registry & Brokerage Infrastructure for Tokenized External Resources)  
**Design System**: Solar Flare Theme  
**Maintained By**: O.R.B.I.T.E.R. Design Team