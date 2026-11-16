# Contributing

## Branches

Use one branch per change, named by what it touches: `tokens/border-dark-fix`, `docs/banner-guidelines`, `component/stepper`.

## Commit messages

Write the message for someone reading `git log` in six months who did not see the conversation.

```
Area: what changed, in the imperative (max ~60 characters)

Why the change was needed, what it affects, and anything a reviewer
should check. Wrap at 72 characters. Name tokens the way Figma does
(Content/positive-outlined) so designers can search for them.

Not in Figma yet: Content/positive-outlined, Content/info-outlined
```

- **Area** is one of `Tokens`, `Docs`, `Chip` (or another component name), `Build`, `CI`.
- The first line says what the commit does, not what you did: "Chip: add left and right icon slots", not "updated chip".
- One logical change per commit. Token value changes and the `dist/` rebuild go in the same commit; unrelated docs fixes do not.
- If Figma is not updated yet, end with a `Not in Figma yet:` line listing the tokens or components.
- Breaking changes (a renamed or removed token, a changed component property) start the body with `BREAKING:`.

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
