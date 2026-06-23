# Architecture

This project uses a feature-sliced structure. A feature owns the UI, page intent, model, and Firebase API that change together. Shared code is intentionally small and should not grow into a generic board-game engine.

## Directory Roles

```text
src/
  app/
    context/       App-level contexts and route guards
    providers/     Global providers such as Chakra, React Query, DnD
    route/         Route table, page registry, page bootstrap

  features/
    auth/          Login/register pages, user model, user API
    game/          Game catalog model/API and game card UI
    lounge/        Lounge model/API, lobby page, lobby-specific UI
    main/          Main page and game entry flow
    yacht-dice/    Yacht Dice API, model, page intent, page UI
    davinci-code/  Davinci Code API, model, page intent, page UI
    the-mind/      The Mind API, model, page intent, page UI

  shared/
    ui/            Small UI kit with no domain ownership
    *.ts           Common utilities, constants, errors, toasts

  models/
    firebase.model.ts
                  Firebase snapshot adapter used by feature APIs
```

## Feature Slice Shape

Game features follow this shape:

```text
features/<feature>/
  api/       Firebase reads/writes and persistence details
  model/     Types, constants, and domain data shape
  page/      Route page, reducer/intent types, page hook
  ui/        Components that know this feature's state or rules
  index.ts   Public API for other slices
```

Not every feature needs every folder. For example, `main` has no Firebase API, and `the-mind` currently has no separate `ui` folder.

## Dependency Rules

Allowed:

- `app` may depend on feature public APIs and `shared`.
- A feature may depend on another feature's public API when it represents a real product dependency.
- Feature internals should prefer local relative imports for files inside the same slice.
- `shared/ui` may depend on Chakra, React, Framer Motion, and other generic libraries.
- Feature APIs may use `models/FModel` as the Firebase snapshot adapter.

Avoid:

- `shared/ui` importing from `features`.
- Game-specific components in `shared/ui`.
- Cross-feature imports into another feature's internal folders unless there is a deliberate reason.
- Rebuilding generic dice/card/chip components until multiple games prove the same behavior is actually shared.

## UI Ownership

Use `shared/ui` only for components whose behavior is stable across games:

- layout wrappers such as `Page`, `Header`, `Loading`
- basic inputs and dividers
- low-level animation wrappers
- low-level drag and dice primitives
- generic modals such as number selection

Keep UI inside a feature when it knows any of these:

- game rules
- turn state
- player/lobby ownership
- Firebase/domain model shape
- scoring, ranking, hand, tile, chip, or card behavior

This keeps shared UI light and prevents common components from accumulating game-specific options.

## Firebase/API Responsibility

Firebase access is encapsulated by feature APIs:

- `features/auth/api` owns user auth/profile access.
- `features/game/api` owns the game catalog.
- `features/lounge/api` owns lounge membership and state.
- each game feature owns its game session API.

Pages, hooks, and UI should call feature APIs instead of importing Firebase directly.

## Adding a New Game

1. Create `src/features/<game-name>/`.
2. Add `api/`, `model/`, `page/`, and `ui/` folders as needed.
3. Export the page and API from `features/<game-name>/index.ts`.
4. Register the route page in `src/app/route/initPages.ts`.
5. Add the route path in `src/app/route/PageRouter.tsx`.
6. Keep game-specific pieces, cards, chips, scoring, and controls inside the game slice.
7. Promote UI to `shared/ui` only after another game needs the same behavior without extra game-specific props.

## Current Boundary Notes

- `src/models` intentionally contains only the Firebase snapshot adapter.
- `features/davinci-code` does not export its whole `ui` folder from the feature root because the model and component share the name `DavinciCodeTile`.
- `features/lounge` is shared by games at runtime, so game pages may depend on its public UI/API when they need common player/lobby data.
