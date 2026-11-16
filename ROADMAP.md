# Roadmap: making MDS a tool people use every day

This is an assessment of MDS as of 0.1.0 (November 2026) and a plan to make it the place designers and developers go first. Figma remains the design tool, so every step below keeps Figma, the token files and the code in step.

## Where MDS is today

**What works well**

- One naming scheme. `Color/Content/action` in Figma is `--color-content-action` in CSS and `Color/Content/action` in the JSON.
- The tokens are in the W3C format, laid out as Tokens Studio sets, and every reference is checked (`npm run check`).
- The docs site is strong for a first version. It has live playgrounds, a Specs tab that reads the real component CSS, contrast checks, and a server-driven UI (SDUI) schema for each component.
- The Overview canvas lets a designer remap a token and see every component change at once. **Copy tokens** → `npm run import` turns that into a reviewable diff.

**What stops people relying on it**

| # | Problem | Who it hurts | Why it matters |
|---|---|---|---|
| 1 | **Two sources of truth.** `docs/index.html` has its own copy of every primitive, semantic mapping, spacing step and size (`P`, `SEM`, `SPACING`, `COMP_SIZES`). `tokens/` is a second copy. | Everyone | The two drift apart without anyone noticing. Every token change today means editing both by hand. |
| 2 | **The Tokens Studio setup probably won't give the Figma structure you expect.** `primitives` is a `source` set, so Tokens Studio uses it to resolve references but does not create primitive variables, and semantic variables get raw hex values instead of aliases. `layout` is enabled in both Light and Dark, so spacing and sizes end up as mode values in the colour collection. The theme group is `Mode`, while the Figma file's collection is `Semantic`. | Designers | A sync can produce a Figma file that looks right but has broken aliases, duplicate collections or renamed variables. Designers then stop trusting the sync. |
| 3 | **Tokens marked "added" or "changed" are not in Figma yet.** These include `Surface/neutral-subtle`, `Border/focus`, `spacing/900`, all component sizing, typography and elevation. | Designers | Designers can't use a token that exists only in code. Developers then get handoffs that use the old values. |
| 4 | **Component code only lives inside the docs page.** The component CSS is a JavaScript string in `docs/index.html`. Nothing outside the page can import it. | Developers | Developers copy HTML and CSS from the Code tab by hand, so every app ends up with its own fork. |
| 5 | **Only web outputs.** `dist/` has CSS and flat JSON. There are no Android (Compose/XML) or iOS (Swift) outputs and no TypeScript types. | Android, iOS and SDUI developers | Native teams retype values, which is where most drift between design and app comes from. |
| 6 | **No release process.** Nothing is versioned. The hosted `tokens.css` changes as soon as `main` changes. | Developers | Any app linking the hosted file breaks with no warning, and nobody can pin a version. |
| 7 | **No checks on pull requests.** The README says CI runs `npm run check` and checks that `dist/` was rebuilt, but no such workflow exists. There is no PR template, although CONTRIBUTING asks for one. | Maintainers | A broken reference or a stale `dist/` can reach `main`. |
| 8 | **Contrast debt.** There are 10 warnings. Four are Dark-mode success and info text, which now share the 400 shade with their borders and are too dark on `Surface/primary` and on the subtle fills. | Users | The colour families have no 300 or 500 steps, so there's no shade that works for both a border and text in Dark mode. |

## What to build, in order

### Phase 1: make the tokens trustworthy (about 2 weeks)

1. **Generate the docs data from `tokens/`.** `npm run build` writes `dist/docs-data.js`, and the docs site loads it instead of its hardcoded tables. The docs-only fields (`use`, `note`, status) already live in `$description` and `$extensions.mds` in the JSON. This removes problem 1, and the token files become the one place to edit.
2. **Fix the Tokens Studio themes so a sync gives the Figma structure you expect.** Test this in a copy of the Figma file before merging.
   - Theme group `Primitives` with one theme where `primitives` is `enabled`. This gives a Primitives collection.
   - Theme group `Layout` with one theme where `layout` is enabled and `primitives` is the source.
   - Theme group `Semantic` with themes `Light` and `Dark`, each enabling its semantic set with `primitives` as the source. This gives one Semantic collection with two modes, aliasing primitive variables.
   - Update `scripts/lib.mjs` `loadTheme` to merge the groups.
3. **Do a round trip with Tokens Studio and write down the steps.** Pull into a copy of Foundation (New), check variable names, aliases and modes, then push a change back and check that it arrives as a pull request. Add the steps, with screenshots, to the docs Introduction page.
4. **Add the "added" and "changed" tokens to Figma.** Then turn the docs' **Token structure** page into a short checklist that reaches zero. While a token is still missing from Figma, the docs should show a "Not in Figma yet" badge on it.
5. **Add checks on pull requests** in `.github/workflows/check.yml`:
   - Run `npm run check`.
   - Run `npm run build` followed by `git diff --exit-code dist/`, so a stale `dist/` fails.
   - Compare contrast warnings against a committed baseline, so new warnings fail and existing ones only warn.
   - Add a PR template (`.github/pull_request_template.md`) with: what changed, the import summary, whether Figma is updated, and Light/Dark screenshots.
   - Add a `.gitignore` covering `exports/*` and `.DS_Store`.
6. **Add a 300 step to the green, red, blue and ClearBlue families.** Map `Border/*` and `Content/*` to it in Dark, so text and border keep one colour and pass 4.5:1. Check the new shades in the Overview editor first.

### Phase 2: ship code that developers import (about 3–4 weeks)

7. **Add a package for each platform**, generated from the same build:
   - `dist/web/`: `tokens.css`, `tokens.d.ts` (a union type of token names, so a typo fails to compile), and `components.css` taken out of the docs `CSS` object.
   - `dist/android/`: `MdsColors.kt` (Compose `lightColors`/`darkColors`), `MdsDimens.kt` and `MdsType.kt`.
   - `dist/ios/`: `MdsColors.swift`, plus an asset catalog with Any/Dark appearances.
   - `dist/sdui/`: a JSON Schema for each component, built from the `schema` functions the docs already have, so the server can validate payloads.

   Either keep the zero-dependency `build.mjs` and add small formatters, or move to Style Dictionary v4, which reads this W3C format directly. Choose Style Dictionary if more than two platforms are needed.
8. **Version every release.** Tag `v0.2.0`, publish `@mygate/mds-tokens` to GitHub Packages, and host a copy of each release at `…github.io/mygateDesignSystem/v0.2.0/tokens.css`. The unversioned URL stays as "latest". The CHANGELOG gets a "Breaking" heading.
9. **Connect Figma to the code with Code Connect** (needs a Figma Organization or Enterprise plan with Dev Mode).
   - Map each Figma component to its code, so developers inspecting a chip in Dev Mode see `chipHTML({ selected, left, right, label })`, or the Compose or Swift call, instead of auto-generated CSS.
   - The docs props already include Figma property names (the Chip page does now). Make that a rule for every component: same property names, same option values.
10. **Add a component status page.** One row per component, with a column each for Figma, Docs, Web, Android, iOS and SDUI. Each cell is Done, Doing or Not started, and the data lives in a JSON file in the repo. This is the page product managers and engineering managers will open most.

### Phase 3: make the docs the first place people look (ongoing)

11. **Search.** Cmd/Ctrl-K over components, tokens (Figma, CSS, Android and iOS names), and guidelines.
12. **Patterns built from real MyGate screens:** visitor approval, payment due, the daily-help list and empty feeds. Each is built from the documented components and links to the matching Figma frame.
13. **Visual regression.** Playwright screenshots of every component page in Light and Dark on each pull request, so a token change shows its effect before merging.
14. **"Copy for…" buttons** on every token: Figma name, CSS variable, Compose name, Swift name.
15. **Release notes page** built from CHANGELOG.md, with before and after images for visual changes.
16. **An icon page.** Today the docs ship a hand-picked set of Phosphor icons inline. List every icon with its Figma component name and the name each platform uses, and add icon sizing rules.

## Rules to keep Figma, tokens and code in step

- **A token change isn't finished until it is in Figma.** The PR template asks whether Figma is updated. If it isn't, the token keeps its "added" or "changed" status, and the docs show it.
- **Component properties use the same names everywhere.** Figma properties, docs props, code parameters and the SDUI schema all use the same name and option values: `selected`, `left`, `right`, `label`.
- **Don't add state tokens.** Pressed and hover states are made by laying `Surface/neutral-subtle` over the fill. In Figma, build this as a "State layer" component that sits above the fill, so designers never pick a pressed colour by hand.
- **Prefer semantic tokens over component tokens.** Add a component-level token only when two or more components need the same exception.

## Decisions needed

- Which native stacks to generate for first: Compose, Swift, Flutter or React Native.
- Whether the team has Figma Dev Mode and Code Connect (Organization or Enterprise plan).
- Whether to add the 300 step (item 6), or accept the Dark-mode contrast of the outlined text and borders.
- `Body Large` line height, 20px or 24px. This is already listed in the README.
