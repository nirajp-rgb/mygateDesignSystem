# Changelog

Every change to tokens or components gets a line here, newest first.

## Unreleased

### Tokens

- Changed: Dark `Content/positive` → green/400, `Content/negative` → red/400 and `Content/info` → blue/400: the same primitives as `Border/positive`, `Border/negative` and `Border/info`. Outlined badges and banners now have one colour for text and outline. `Content/warning` already matched `Border/warning`.
- Contrast: these Dark text colours are below 4.5:1 on `Surface/primary` (success 3.8:1, info 3.1:1) and on their subtle fills (success 3.3:1, info 3.4:1). Error passes. `npm run check` reports them.

### Components

- Chip: left and right icon slots. The left slot takes the check (shown when selected) or any icon, which the check replaces when the chip is selected. The right slot takes a dropdown caret or a clear icon. Figma properties are listed in the docs.

## 0.1.0 · 2026-11-16

First version, built from the Figma file Foundation (New).

### Tokens

- Primitives, Semantic (Light and Dark), spacing, borderRadius and icon sizing are taken from the Figma variables.
- Added: `Surface/neutral-subtle` (a see-through fill, also used as the pressed state layer), `Surface/action-secondary-bold`, `Surface/overlay`, `Border/focus` and `spacing/900`.
- Added: component sizing `sizing/{component}/{size}` for button, iconButton, input, chip, tab, avatar, checkbox, switch, listItem and emptyState.
- Added: `typography/*`, `elevation/100–300` and `borderWidth/default`.
- Added primitives: `orange/700`, `brand/ClearBlue-600`, `brand/ClearBlue-a35` and `gray/a10`.
- Changed: `Content/action`, `positive`, `negative`, `warning` and `info` now map to shades that pass 4.5:1.
- Changed: `Surface/*-bold` is now the dark (600) shade, so it carries white text. This replaces separate `-strong` tokens.
- Changed: dark mode `Surface/disabled` → gray/700 and `Content/disabled` → gray/500.
- To deprecate: `Accent/primary`, `Accent/secondary` and `Accent/secondary-subtle`. Each duplicates a `Surface/action-*` token.

### Components

- Button, Icon button, Text field, Chip, Checkbox, Radio group, Switch, Card, List item, Bottom sheet, Banner, Badge, Skeleton, Empty state, Top app bar, Tabs and Bottom navigation, each with types, variants, guidelines, specs and code in `docs/`.
