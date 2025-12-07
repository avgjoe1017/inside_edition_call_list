# Design System Documentation

## Overview

The Inside Edition Call List app uses a professional, modern design system inspired by contemporary iOS applications. The design prioritizes clarity, hierarchy, and subtle elegance.

---

## Design Principles

1. **Clarity First** - Information is presented clearly without decoration
2. **Subtle Depth** - Cards use minimal shadows for depth perception
3. **Consistent Spacing** - 4px, 8px, 12px, 16px rhythm throughout
4. **Clear Hierarchy** - Typography sizes establish visual importance
5. **Purposeful Color** - Color indicates meaning, not decoration

---

## Color System

### Backgrounds

```typescript
Light Mode:
- Primary Background: #F5F5F7 (Apple-style light gray)
- Card Background: #FFFFFF
- Section Background: #F9FAFB
- Input Background: #F9FAFB

Dark Mode:
- Primary Background: #000000
- Card Background: #1C1C1E
- Section Background: #2C2C2E
- Input Background: #2C2C2E
```

### Text Colors

```typescript
Light Mode:
- Primary: #111827 (Display text, headlines)
- Secondary: #374151 (Body text)
- Tertiary: #6B7280 (Captions, metadata)
- Quaternary: #9CA3AF (Very subtle text)

Dark Mode:
- Primary: #FFFFFF
- Secondary: #EBEBF5
- Tertiary: #98989D
- Quaternary: #636366
```

### Accent Colors

**Primary Blue** - CTAs and interactive elements
- Light: #0066FF
- Dark: #60A5FA

**Amber** - 3:30 PM Feed
- Light: #F59E0B
- Dark: #FCD34D

**Purple** - 6:00 PM Feed
- Light: #A855F7
- Dark: #C084FC

**Green** - Success states
- Light: #059669
- Dark: #34D399

**Red** - Errors and failures
- Light: #DC2626
- Dark: #F87171

---

## Typography

### Font Sizes & Weights

```
Display/Title: 20-24px, Bold (font-bold)
Headline: 18px, Bold (font-bold)
Subheadline: 16px, Semibold (font-semibold)
Body: 14-16px, Regular/Medium
Caption: 12-13px, Regular/Medium
Footnote: 11px, Regular
```

### Usage

- **Display**: Screen titles, primary card headings
- **Headline**: Secondary headings, important information
- **Subheadline**: Phone numbers, station names
- **Body**: Regular text, descriptions
- **Caption**: Timestamps, metadata
- **Footnote**: Legal text, fine print

---

## Cards

### Standard Card

```typescript
{
  backgroundColor: colors.cardBackground,
  borderRadius: 12,      // rounded-xl
  padding: 16,           // p-4
  marginBottom: 12,      // mb-3
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,   // Subtle!
    shadowRadius: 8,
    elevation: 2,
  }
}
```

### Card Sections

Cards are divided into logical sections with dividers:

```
┌─────────────────────────────┐
│ Header (p-4)                │
├─────────────────────────────┤ ← 1px divider
│ Content (px-4, py-3)        │
├─────────────────────────────┤
│ Footer/Actions (px-4, py-3) │
└─────────────────────────────┘
```

---

## Status Badges

### Market Number Badge

```typescript
<View className="px-3 py-1.5 rounded-full">
  <Text className="text-sm font-bold">#{marketNumber}</Text>
</View>
```

Colors:
- 3pm markets: Amber background
- 6pm markets: Purple background

### Alert Type Badge

```typescript
<View className="p-2.5 rounded-full">
  {isVoice ? <Mic /> : <MessageSquare />}
</View>
```

Colors:
- Voice alerts: Indigo (#EEF2FF background, #6366F1 icon)
- Text alerts: Green (#F0FDF4 background, #10B981 icon)

### Status Indicator

```typescript
<View className="px-2.5 py-1 rounded-full">
  <Text className="text-xs font-semibold">{status}</Text>
</View>
```

Used for:
- Delivery status (Confirmed, Shipped, Fulfilled)
- Recipient groups (All Stations, 3:30 Feed, 6:00 Feed)
- Phone reliability (Reliable, Warning, Failed)

---

## Spacing System

### Padding Scale

```
px-2:  8px
px-3:  12px
px-4:  16px  ← Most common for cards
px-5:  20px
px-6:  24px
```

### Margin Scale

```
mb-2:  8px
mb-3:  12px  ← Most common between cards
mb-4:  16px
mb-6:  24px
```

### Gap Scale

```
gap-1:  4px
gap-2:  8px   ← Common for inline elements
gap-3:  12px
gap-4:  16px
```

---

## Interactive Elements

### Buttons

**Primary Button**
```typescript
{
  backgroundColor: colors.primary.text,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 12,
}
```

**Secondary Button**
```typescript
{
  backgroundColor: colors.primary.background,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 12,
}
```

### Pressable States

```typescript
style={({ pressed }) => ({
  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
  opacity: pressed ? 0.9 : 1,
})}
```

---

## Icons

### Sizing

```
Small:  14-16px (Inline with text)
Medium: 18-20px (Standard UI)
Large:  24px (Primary actions)
```

### Colors

Icons inherit their section's semantic color:
- Primary actions: `colors.primary.text`
- Metadata: `colors.textTertiary`
- Warnings: `#DC2626`
- Success: `#059669`

### Stroke Width

```
Regular: 2
Bold: 2.5
```

---

## Screen Layouts

### Standard Screen Structure

```
┌──────────────────────────────┐
│ Navigation Header            │
├──────────────────────────────┤
│ Filter Section (Card)        │  ← mx-4, mt-3, rounded-xl
│   ├─ Search                  │
│   ├─ Time Filter             │
│   └─ List Filter             │
├──────────────────────────────┤
│ Content (ScrollView)         │
│   ├─ Card 1                  │  ← px-4
│   ├─ Card 2                  │
│   └─ Card 3                  │
└──────────────────────────────┘
```

### Margins

- Screen edges: 16px (px-4)
- Between sections: 12px (mb-3)
- Content bottom: 32px (pb-8) for scroll overscroll

---

## Shadows & Elevation

### Light Mode

```typescript
{
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,   // Very subtle
  shadowRadius: 8,
  elevation: 2,
}
```

### Dark Mode

```typescript
{
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.5,    // More pronounced
  shadowRadius: 8,
  elevation: 5,
}
```

### Usage

- Cards: Standard shadow
- Modals: Heavier shadow (elevation 8-10)
- Floating buttons: Medium shadow (elevation 4-6)

---

## Borders

### Border Widths

```
Subtle: 0.5px (Very light dividers)
Standard: 1px (Section dividers)
Emphasis: 1.5-2px (Error states)
```

### Border Colors

```typescript
Light Mode:
- Subtle: #F3F4F6
- Light: #E5E7EB
- Standard: #D1D5DB

Dark Mode:
- Subtle: #1C1C1E
- Light: #2C2C2E
- Standard: #38383A
```

---

## Loading & Empty States

### Loading Spinner

```typescript
<ActivityIndicator 
  size="large" 
  color={colors.primary.text} 
/>
<Text style={{ color: colors.textTertiary }}>
  Loading markets...
</Text>
```

### Empty State

```typescript
<View className="items-center justify-center py-12">
  <Text style={{ color: colors.textTertiary }}>No markets found</Text>
  <Text style={{ color: colors.textTertiary }}>Try different filters</Text>
</View>
```

---

## Accessibility

### Contrast Ratios

- Primary text: 4.5:1 minimum
- Secondary text: 4.5:1 minimum
- Interactive elements: 3:1 minimum

### Touch Targets

- Minimum: 44x44pt
- Recommended: 48x48pt
- Buttons: 44pt height minimum

### Dynamic Type

All text sizes should scale with system font size preferences.

---

## Best Practices

### DO

✅ Use rounded-xl (12px) for cards
✅ Use subtle shadows (0.05 opacity in light mode)
✅ Group related information in card sections
✅ Use color purposefully (badges, status indicators)
✅ Maintain consistent spacing (4/8/12/16px)
✅ Provide visual feedback on interaction (pressed states)

### DON'T

❌ Use heavy shadows
❌ Mix border radii (stick to 8px, 12px, or full)
❌ Use color decoratively
❌ Create unnecessary visual noise
❌ Forget loading/empty states
❌ Ignore pressed/hover states

---

## Examples

### Market Card

```
┌─────────────────────────────────┐
│ New York             #1 (badge) │  Bold, 20px
│ WCBS                            │  Medium, 14px, tertiary
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Airs at 7:00 PM EST         │ │  Section bg
│ └─────────────────────────────┘ │
├─────────────────────────────────┤  1px divider
│ 📞 212-555-1234       [Call]    │  Pressable
│    News Desk                    │
├─────────────────────────────────┤
│      View Details →             │  Pressable
└─────────────────────────────────┘
```

### Alert History Card

```
┌─────────────────────────────────┐
│ 📱 Text Alert           9:41 AM │  Icon + title + time
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Breaking news: Update on... │ │  Message preview
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 👥 All Stations (210)           │  Recipient info
│                    by John Doe  │
└─────────────────────────────────┘
```

---

## Version History

- **v1.0** (2025-01) - Initial design system established
- Professional color system with #F5F5F7 background
- Subtle shadow system (0.05 opacity)
- Card-based layouts with clear sections
- Status badges inspired by modern iOS apps
