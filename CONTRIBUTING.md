# Contributing

## Branches

Use one branch per change, named by what it touches: `tokens/border-dark-fix`, `docs/banner-guidelines`, `component/stepper`.

## Token changes

1. Make the change in the docs Overview, then use **Copy tokens** and save the result to `exports/`. You can also edit `tokens/*.json` directly.
2. `npm run import -- exports/<file>.json` if you exported.
3. `npm run build`
4. Update `CHANGELOG.md`.
5. Open a pull request using the template.

### Naming

- Semantic colours: `Color/{Surface|Content|Border|Accent}/{role}-{strength}`.
  - Strength is empty, `-subtle` (a tinted background that takes coloured text) or `-bold` (a solid fill that takes white text).
  - Content tokens for text on fills are `onLight`, `onDark` and `onContrast`.
- Sizes: `sizing/{component}/{size}`, aliasing a `Dimension` primitive.
- Don't add pressed or hover tokens. States are made by layering `Surface/neutral-subtle` over the fill.
- Before adding a semantic token, check whether an existing role covers it. New tokens need a `$description` that says what to use them for.

### Review

- `npm run check` must pass. Read the contrast warnings; any new warning needs a reason in the pull request.
- Look at the change in the docs site in both Light and Dark.
- If Figma is not updated in the same change, say so in the pull request.

## Docs and component changes

The docs site is a single file, `docs/index.html`. Component CSS lives in the `CSS` object inside it, and the docs Specs tab reads that CSS. So every token a component uses must be a CSS variable, never a raw value.
