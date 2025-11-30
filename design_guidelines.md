# Zyx Discord Bot - Design Guidelines

## Design Approach
**Hybrid System-Reference Approach**: Drawing from successful Discord bot dashboards (MEE6, Dyno) combined with modern dashboard design systems (Fluent Design, Material Design) for a polished, professional interface that feels native to Discord users while maintaining functional clarity.

## Core Design Principles
1. **Dual Identity**: Landing pages emphasize brand personality; dashboard prioritizes efficiency and clarity
2. **Discord Ecosystem Harmony**: Visual language that feels familiar to Discord users without direct copying
3. **Information Hierarchy**: Clear paths from overview to detailed configuration
4. **Trust & Credibility**: Professional polish that inspires confidence in bot reliability

---

## Typography System

**Font Stack**:
- Primary: Inter (CDN: Google Fonts) - Clean, modern, excellent readability
- Accent: Space Grotesk (headings, branding) - Tech-forward personality

**Hierarchy**:
- Hero Headline: text-6xl/text-7xl, font-bold, Space Grotesk
- Page Titles: text-4xl, font-bold, Space Grotesk  
- Section Headers: text-2xl/text-3xl, font-semibold, Inter
- Card Titles: text-xl, font-semibold, Inter
- Body Text: text-base, font-normal, Inter
- Labels/Meta: text-sm, font-medium, Inter
- Captions: text-xs, font-normal, Inter

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16, 20** (p-2, m-4, gap-8, py-12, px-16, space-y-20)

**Container Strategy**:
- Full-width sections with inner max-w-7xl for landing
- Dashboard: max-w-screen-2xl for workspace areas
- Content blocks: max-w-prose for readable text

**Grid Patterns**:
- Feature grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-8
- Dashboard cards: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3, gap-6
- Stats display: grid-cols-2 md:grid-cols-4, gap-4

---

## Page-Specific Layouts

### Landing Page Structure

**Hero Section** (90vh):
- Asymmetric two-column layout (60/40 split)
- Left: Headline, subheadline, dual CTA (Add to Discord primary, View Demo secondary)
- Right: Large hero image showing Zyx dashboard interface or Discord integration visual
- Stats bar below hero: "X Servers • X Commands Executed • X Active Users" in grid-cols-3

**Features Section** (py-20):
- Three-column grid showcasing core modules
- Each card: Icon (Heroicons), title, 2-3 line description, "Learn More" link
- Cards: Moderation Tools, Ticket System, Server Analytics

**Commands Preview** (py-20):
- Two-column layout alternating image/content
- Left: Code block showing slash commands, Right: Feature explanation
- Visual representations of bot responses and embed messages

**Dashboard Preview** (py-20):
- Large centered screenshot/image of dashboard interface
- Annotated callouts highlighting key features (modal overlays pointing to features)

**Trust Signals** (py-16):
- Single-column centered: "Trusted by X servers" with server count animation
- Three-column grid: Uptime guarantee, Active development, Community support

**CTA Section** (py-20):
- Centered, contained (max-w-4xl)
- Headline: "Ready to upgrade your Discord server?"
- Dual buttons with Add to Discord prominent

### Dashboard Layout

**Navigation**:
- Left sidebar (w-64): Zyx logo/brand at top, navigation items with icons (Overview, Moderation, Tickets, Settings, Servers)
- Top bar: Server selector dropdown, user profile menu, notification bell

**Overview Dashboard**:
- Grid layout (grid-cols-1 lg:grid-cols-3, gap-6)
- Top row: 4 stat cards (grid-cols-2 lg:grid-cols-4) - Total Members, Active Tickets, Mod Actions Today, Bot Uptime
- Middle section (col-span-2): Recent Activity feed with timeline view
- Right sidebar (col-span-1): Quick Actions panel with common tasks

**Moderation Settings Page**:
- Two-column layout (2/3 - 1/3 split on xl)
- Main area: Sections for each command type (Ban, Kick, Mute, Warn) with toggle switches, role selectors
- Sidebar: Mod log channel selector, Auto-mod rules preview

**Ticket Settings Page**:
- Single-column flow with clear section breaks (space-y-12)
- Category creator with add/remove interface
- Support roles multi-select
- Ticket panel customization with live preview panel

---

## Component Library

### Navigation Components
- **Sidebar Nav Items**: Icon + label, active state with subtle indicator bar, hover state with background treatment
- **Server Dropdown**: Avatar + server name + chevron, opens modal with server list and search

### Cards & Containers
- **Feature Cards**: Rounded corners (rounded-xl), generous padding (p-8), icon at top, title, description, optional CTA
- **Stat Cards**: Compact (p-6), large number display (text-4xl), label below (text-sm), optional trend indicator
- **Settings Cards**: Form-style with clear labels, input groups with helper text, save indicator

### Forms & Inputs
- **Text Inputs**: Full-width with label above, placeholder text, helper text below, error states
- **Toggle Switches**: iOS-style with label, current state label (On/Off)
- **Dropdowns**: Custom styled with search for long lists (role selectors, channel pickers)
- **Multi-Select**: Pill-style selected items with remove (x) button

### Buttons
- **Primary CTA**: "Add to Discord" with Discord logo icon (from Heroicons), larger padding (px-8 py-4)
- **Secondary**: Outline style with hover fill
- **Tertiary**: Text-only with underline on hover
- **Icon Buttons**: Square with icon only, used in tables/lists for actions

### Data Display
- **Tables**: Striped rows, sticky header, sortable columns, action column on right
- **Activity Feed**: Timeline style with icons on left, timestamp, event description
- **Code Blocks**: Monospace font (font-mono), syntax highlighting suggested areas with comments

### Overlays
- **Modals**: Centered, max-w-2xl, backdrop blur, slide-in animation
- **Toasts**: Top-right positioned, auto-dismiss, success/error states with icons

---

## Images

### Hero Image
Large hero image (right side of asymmetric layout) showing:
- Polished screenshot of Zyx dashboard interface in action
- Or: Stylized 3D render of Discord-style interface with Zyx branding
- Must convey professionalism and modern design

### Additional Images
- **Dashboard Preview Section**: Full-width screenshot showing complete dashboard with annotations
- **Commands Preview**: Screenshots of bot responses in Discord channels showing embeds and interactions
- **Feature Cards**: Optional icon illustrations for Moderation (shield), Tickets (message bubbles), Analytics (graph)

---

## Accessibility & Polish

- All interactive elements keyboard navigable
- Form inputs with proper labels and ARIA attributes  
- Focus indicators visible and clear (ring-2 ring-offset-2)
- Sufficient contrast maintained throughout (checked via contrast checker)
- Loading states for async actions (skeleton screens for dashboard)
- Empty states with helpful messaging and CTAs
- Error states with clear resolution paths

---

## Icon Library
**Heroicons** (via CDN) - outline style for navigation, solid for emphasis points