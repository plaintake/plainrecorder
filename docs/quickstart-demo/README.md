# How the quickstart video was taken

The quickstart tutorial — install PlainTake, write a scenario, validate, run, and get a
finished `demo.mp4` — was recorded by PlainTake itself, from this folder. Nothing was
screen-recorded, edited, or re-taken, even though most of a quickstart happens in a
terminal. This page is the whole recipe.

## The trick: the terminal is a web page

PlainTake films the browser and only the browser. So the terminal, the code viewer, the
player and the file tree the video walks through are the static pages in
[`pages/`](pages/) — plain HTML styled with the same tokens as the bundled fixture app,
served by [`serve.mjs`](serve.mjs) and passed to the run with `--base-url`. Commands are a
transcript; the output rows appear when the scenario clicks the command, with a single
160 ms reveal defined unconditionally (the recorder sets `reduced-motion`, so nothing in
these pages is allowed to animate conditionally).

The player page is the honest part: it embeds the **real** `demo.mp4` that
`plaintake run examples/release-approval.demo.ts --fixture` produces — the same command the
video teaches, recorded by the make target with the same `plaintake.config.json` as the
tutorial so the credit card inside the player says **Made with PlainTake** too (which is
exactly what a viewer's Free-tier run of that command shows). `serve.mjs` mounts it from
`artifacts/release-approval/output/` at request
time, so no derived binary is ever copied into `public/` (which syncs to the public
repository, and whose exact file list is pinned by `test/integration/release-docs.spec.ts`
— a file added here must be added there too, or CI fails).

The flow the tutorial teaches is the landing-page video's flow, minus the handoff:
[`public/docs/site-demo/release-0.2.0.demo.ts`](../site-demo/release-0.2.0.demo.ts) records
the same release approval with `handoff: 'session'`, so a person clicks Approve in a visible
browser. The taught example automates that click, which keeps `make quickstart-demo`
re-recordable unattended (and is why the two scenarios otherwise read the same).

## The scenario

[`quickstart.demo.ts`](quickstart.demo.ts) is the exact source that ran: an intro card,
five chapters — Install, Write the scenario, Validate, Record, The bundle — twelve narrated
steps, and two asserts (the validate output is visible; the embedded video really played).
Every step declares its `target`, so the drawn pointer marks the line being talked about.
And every page change happens *between* steps, never inside a step's `run()`: the recorder
measures the target before `run()` starts, and a target that is not on the current page yet
costs a two-second probe timeout — and with it the pointer's glide to that line.

## The command

```sh
make quickstart-demo
```

which expands to: record the example bundle with the same `--config` as the tutorial (so
the embedded video's credit matches), start the pages server,
wait for it, and run

```sh
plaintake run public/docs/quickstart-demo/quickstart.demo.ts \
  --output artifacts/quickstart-demo \
  --base-url http://127.0.0.1:4173 \
  --subtitles soft --cursor on --speech on \
  --config public/docs/quickstart-demo/plaintake.config.json
```

What each flag contributed:

- `--subtitles soft` — a selectable caption track. Right for YouTube, where the `.vtt`
  sidecar is uploaded as closed captions; re-render with `plaintake render --subtitles
  hard` for anywhere that ignores in-container tracks.
- `--cursor on` — the pointer glides to each step's declared `target`.
- `--speech on` — the narration, synthesised locally from the steps' subtitles.
- `--config plaintake.config.json` — pins the outro card to **Made with PlainTake**. On
  Pro a run normally takes its branding from the machine's global config, whose card is a
  product ad — and Pro has no "default credit" fallback, because paying *removes* the
  credit. The file re-declares the Free-tier credit text in the same colours the intro
  card already uses, so the tutorial ends on the dogfood punchline wherever it is
  re-recorded. The make target records the embedded example with the same file, for the
  same reason: without it the credit *inside* the player would be whatever this machine's
  global config says.

Note what is *absent*: `--camera zoom`. The camera caps its zoom to keep text legible,
and at that cap the framing window is narrower than the code lines this tutorial films —
zooming would crop the very content being explained, so the tutorial stays at full frame.
The pages are sized for it (1080p-first, mono ≥ 28 px). The happy side effect: with no
Pro flags anywhere, the recorded command runs verbatim on the Free tier.

For debugging, the two-terminal equivalent: `node public/docs/quickstart-demo/serve.mjs`
in one terminal, the `plaintake run` line above in the other.

## Why `--base-url` and not `--fixture`

The example the tutorial *teaches* uses `--fixture` — that is the point being made on
screen. But the tutorial itself films pages that are not the fixture app, so the run
points at `serve.mjs` instead. No handoff is involved, so nothing here constrains the
recording.

## One honest caveat

The player page plays a real `<video>` element. Live playback introduces frame-level
jitter into the captured session, so this one recording is **not byte-identical across
runs** — per-run `plaintake verify` still passes, and re-rendering a frozen bundle is
untouched. Every other frame of the video is as deterministic as any PlainTake recording.
If byte-identity for this recording ever mattered, the fallback is committing stills of
the embedded demo and crossfading those instead of playing the file.

The pages also deliberately contain no literal version numbers — the download line uses
`$VERSION` the way the install guide does — so a release bump cannot leave the video's
recipe pointing at a tarball that no longer exists.

## Publishing to YouTube

For the **@plainlabdev** channel, per the convention used by the landing-page video:

- Upload `artifacts/quickstart-demo/output/demo.mp4`.
- The soft `mov_text` track is **not displayed** by YouTube — upload
  `artifacts/quickstart-demo/captions/captions.vtt` as an English caption file
  (Studio → Subtitles → Add language → English → Upload file → With timing), or the
  narration text will be invisible.
- Thumbnail (YouTube takes JPG/PNG only):
  `ffmpeg -i <poster> -frames:v 1 -q:v 2 quickstart-thumb.jpg`.
- Unlisted first, check the captions, then Public.
