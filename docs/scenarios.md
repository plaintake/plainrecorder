# Writing a scenario: full reference

The [README](../README.md) has a short version of this. This is the complete one — every
metadata field, every `demo` method, and the rules a scenario has to follow — for whoever
wants the depth: a human writing one by hand, or an agent with no other context than this file
and [`schema/scenario.schema.json`](../schema/scenario.schema.json).

A scenario is one file, one default export:

```ts
import { defineDemo } from '@plaintake/scenario';

export default defineDemo({
  schema: 'agent-demo.scenario/v1',
  id: 'create-api-key',
  title: 'Create an API key',
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  locale: 'en-US',
  timezoneId: 'UTC',
  colorScheme: 'light',
  reducedMotion: 'reduce',

  async run({ page, demo, baseURL }) {
    await demo.mask({ id: 'secret', selector: '[data-testid="api-key-value"]' });
    await demo.chapter('Organization settings');
    await demo.step({
      id: 'open-settings',
      title: 'Open organization settings',
      subtitle: 'Open the organization settings.',
      holdMs: 1500,
      run: () => page.goto(`${baseURL}/settings`, { waitUntil: 'load' }),
    });
    await demo.assert({
      id: 'settings-visible',
      title: 'Settings heading is visible',
      run: () => page.getByRole('heading', { name: 'Organization settings' }).waitFor(),
    });
  },
});
```

## Metadata

| Field | Type | Required | Notes |
|---|---|---|---|
| `schema` | `'agent-demo.scenario/v1'` | yes | The only value accepted today. |
| `id` | lowercase kebab-case string | yes | Authored and stable. Never generate it — it names the scenario across every run. |
| `title` | non-empty string | yes | Shown in `validate`/`inspect` output. |
| `language` | string, min length 2 | no, defaults to `'en'` | The narration/caption language tag. |
| `viewport` | `{width:1920,height:1080,deviceScaleFactor:1}` | yes | The only supported viewport; every field is a literal. |
| `locale` | `'en-US'` | yes | The only supported locale. |
| `timezoneId` | `'UTC'` | yes | The only supported timezone. |
| `colorScheme` | `'light'` | yes | The only supported scheme. |
| `reducedMotion` | `'reduce'` | yes | The only supported value — recordings must not depend on CSS motion. |
| `allowedConsoleErrors` | string array | no, defaults to `[]` | Exact console error strings this scenario tolerates. Anything else fails the run. |
| `handoff` | `'none' \| 'preflight' \| 'session'` | no, defaults to `'none'` | See [Handing the browser to a person](#handing-the-browser-to-a-person). |
| `handoffTimeoutMs` | integer, 5000–300000 | no, defaults to `120000` | How long a handoff waits for a person before giving up. 300000 (5 minutes) is a hard ceiling — past that a wait is indistinguishable from a hang. |
| `intro` | object | no | See [The opening card](#the-opening-card). |
| `camera` | object | no | See [Framing](#framing). |

The machine-readable version of this table is
[`schema/scenario.schema.json`](../schema/scenario.schema.json).

## The `demo` DSL

Everything below is a method on the `demo` object `run()` receives, alongside `page` (a
Playwright `Page`) and `baseURL` (the string passed to `--base-url`/`fixture`).

| Method | Signature | Purpose |
|---|---|---|
| `chapter` | `(title: string) => Promise<void>` | Marks a chapter boundary on the timeline. Holds an establishing beat before the next step starts. MP4 chapter markers are a Pro feature; the events themselves are recorded on every tier. |
| `step` | `({id, title, subtitle?, target?, action?, holdMs?, run}) => Promise<void>` | The unit of narrated action. `run` performs it; `target` (a `Locator`) is recorded for the cursor/camera to read, never used to act; `action` (`'click' \| 'type' \| 'point'`) tells the cursor what to draw. |
| `assert` | `({id, title, run}) => Promise<void>` | A checked expectation. A rejection fails the run; it does not stop the recording. |
| `mask` | `({id, selector, reason?}) => Promise<void>` | Hides a CSS selector's contents in every frame it could appear in, from the moment it is registered — register it *before* the element exists so nothing is ever visible. A selector, not a `Locator`, is what makes that possible. |
| `waitFor` | `({id, title, until, timeoutMs?}) => Promise<void>` | Waits on a condition that prompts nobody — a push notification, an emailed link, a background job. Needs no window and no terminal; works headless and in CI. |
| `handoff` | `({id, title, detail?, until?, timeoutMs?, mask?}) => Promise<void>` | Hands the real browser window to a person. Requires `handoff` in the scenario's metadata; only available in `run()` when `handoff: 'session'`, and in `preflight()` always. See below. |
| `pause` | `(ms: number) => Promise<void>` | An explicit, recorded pause. Prefer this over `page.waitForTimeout`: it races the run's abort signal and appears on the timeline. |

Pass `{ timeout: 0 }` to whatever Playwright call sits inside a `waitFor`'s or `handoff`'s
`until`, so the DSL's own `timeoutMs` is the only deadline — otherwise Playwright's own 30s
default fires first and blames the locator instead.

Two more hooks can sit beside `run()` in the same `defineDemo()` call:

- **`preflight({ page, demo, baseURL })`** — runs before recording and tracing start, and
  hands the page back on `about:blank`. Only `waitFor` and `handoff` are available on its
  `demo` — there is no video timeline yet, so `chapter`/`step`/`assert`/`mask` would have
  nothing to write to. This is where a sign-in belongs: nothing it does reaches the video or
  the trace.
- **`warmup({ page, demo, baseURL })`** — runs after `preflight`'s hand-back and before
  recording begins. Same restricted `demo` as `preflight`, for the same reason. Use it to
  navigate to the page the video should open on, when starting cold would film a blank load.

## Rules that matter in practice

- **`id` values are authored and stable.** Never generate them.
- **Set `holdMs`.** Narration is timed at roughly 20 characters/second with a 1200ms minimum,
  so a step that finishes in 40ms still needs its caption on screen for over a second. Without
  holds the video becomes a frozen frame with captions scrolling over it.
- **Masks take a CSS selector, not a `Locator`**, so they can be registered before the element
  exists — that is what makes "masked before the secret is ever visible" true.
- **No `Date.now()`, no `Math.random()`, no external network.** A scenario must be
  deterministic: the same scenario run twice should produce the same ordered steps, captions
  and assertions.
- **Erasable TypeScript only** — no `enum`, `namespace`, parameter properties, or decorators.
  Node's type-stripping loader cannot erase them, and `validate` rejects them by name before a
  browser opens.

## The opening card

```ts
intro: {
  lines: ['CSV to PDF mail merge', 'no sign-up'],
  narration: 'This is a free C S V to PDF mail merge, and it needs no sign-up.',
  durationMs: 3000,
},
```

- **`lines`** — one or two lines, centred on a flat background. Available on every tier.
- **`narration`** — optional, read aloud by the same voice as a step's `subtitle` when the run
  has `--speech` on.
- **`durationMs`** — optional, and a floor rather than a duration: if the spoken line needs
  longer, the card lengthens to fit rather than cutting it off. Defaults to 3s, capped at 15s.

## Framing

```ts
camera: { maxZoom: 1.35, minDwellMs: 1000 },
```

Every field is optional; the defaults are what the camera has always used, so a scenario that
says nothing is framed exactly as before this existed.

- **`maxZoom`** (1–1.6, default 1.6) — the zoom ceiling. At 1.6x, 37% of the frame is
  discarded, which crops a busy layout at the edge; 1.3–1.4x keeps more context.
- **`margin`** (0–2, default 0.3) — breathing room kept around each target, as a fraction of
  the target per side. The gentler alternative to lowering `maxZoom`.
- **`easeMs`** (133–2000, default 800) — how long a camera move takes.
- **`minDwellMs`** (0–5000, default 0) — settled time guaranteed on screen for a targeted step,
  on top of the ease.

## Handing the browser to a person

A one-time code or a CAPTCHA cannot be scripted. Declare `handoff: 'preflight'` (or
`'session'`) in the metadata, then call `demo.handoff()` from the matching phase:

```ts
export default defineDemo({
  // ...metadata...
  handoff: 'preflight',
  handoffTimeoutMs: 120_000,

  async preflight({ page, demo, baseURL }) {
    await page.goto(`${baseURL}/login`);
    await demo.handoff({
      id: 'sign-in',
      title: 'Sign in, including any 2FA',
      detail: 'The browser window is yours. Come back here when the dashboard is up.',
      until: () => page.waitForURL('**/dashboard', { timeout: 0 }),
    });
  },

  async run({ page, demo, baseURL }) { /* already signed in */ },
});
```

`preflight` is the mode to reach for — it reaches neither the video nor the trace. `session`
puts the wait inside the recording, filmed exactly as it happened, which is right only for a
step-up challenge that is genuinely part of the demo. Either way, the only thing that comes
back from the prompt is *done*, *gave up*, or *never mind* — there is nowhere for a secret to
go. A `session` handoff also accepts a `mask` (a selector, applied the same way `demo.mask`
is) for a field the person fills in.

## Worked example

The scenario at the top of this file — masks, chapters, steps, an assertion — is a real one;
its recorded output (stills, captions, manifest) is in [`docs/samples/`](samples/README.md).
`plaintake validate <file>` checks any scenario, yours included, against everything on this
page with no browser.
