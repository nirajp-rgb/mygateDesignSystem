# Changelog

Every change to tokens or components gets a line here, newest first.

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
