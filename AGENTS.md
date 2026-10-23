This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Copy & translations

The app supports Spanish and English via `i18next`/`react-i18next`, with the
user's choice in `Ajustes` (`Settings.idioma`, backed by `expo-localization`
for the first-run guess). Never hardcode user-facing text directly in a
component.

- Add every new string to **both** `src/i18n/locales/es.json` and
  `src/i18n/locales/en.json` under the same key, then read it with
  `useTranslation()`'s `t()` in components or the `i18n` singleton
  (`src/i18n/index.ts`) in plain utils/data files that can't use hooks (see
  `utils/dates.ts`, `utils/format.ts`, `utils/nutrition.ts` for the pattern).
- Reuse existing keys before adding new ones — macro names, units, and common
  actions (`common.*`, `macro.*`, `units.*`) are shared across many screens.
- Numbers, dates, and decimal/thousands separators must stay locale-aware:
  use `formatNumber`/`formatDecimal` from `utils/format.ts` and
  `formatDayLabel` from `utils/dates.ts` rather than formatting inline.
- Anything stored in `AsyncStorage` must use a stable, language-independent
  key, not a translated display string — e.g. `Meal.tipo` stores
  `'breakfast' | 'lunch' | 'afternoonSnack' | 'dinner' | 'snack'` and is only
  translated at render time via `t(\`mealTypes.${tipo}\`)`. If you add a new
  enum-like field that gets persisted, follow the same pattern (stable key in
  storage, translated label in the UI) instead of saving the display text.
- Base food names (`src/data/foods.ts`) have an English counterpart in the
  `FOOD_NAME_EN` lookup, shown via `foodDisplayName()`. User-created
  ("propio") foods are never translated — they stay exactly as typed. When
  adding a new base food, add its English name to `FOOD_NAME_EN` too.
