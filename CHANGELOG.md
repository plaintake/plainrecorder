# Changelog

`scripts/release.sh` reads the section for the version being released and uses it as the
GitHub release notes, so this file is the source of what a customer reads — not a summary
written afterwards.

## 0.1.0

First release.

**Recording.** A committed TypeScript scenario drives a real Chromium through Playwright and
produces a narrated video. Steps, waits, masks and chapters are declared in the scenario; no
recording is done by hand and no take is edited.

**Apps behind a login.** A scenario can stop and hand you the real browser window — to sign in,
solve a CAPTCHA, or complete a step-up challenge — and carry on once you are done. Put that in
`preflight` and it happens **before** recording starts, so the sign-in is in neither the video
nor the trace; a `session` handoff waits with the camera running, for a challenge that is
genuinely part of the demo.

You act in the browser, not in PlainTake. It never asks for a password, a code, or anything else
secret, and there is nowhere for one to go if you tried: the only thing the prompt sends back is
*done*, *gave up*, or *never mind*. A recording that hands the browser over also records no
Playwright trace at all, because a trace captures every field value — password fields included —
along with request bodies and cookies, and a bundle of your logged-in session is not something to
produce by accident.

It needs a visible browser window and a terminal, so locally it runs from `plaintake run` or
the menu. From an AI agent it depends on the client: one that supports elicitation asks you in
chat when you are done — the window opens on your screen, since the server is local, and the
question is a single *done* checkbox with nowhere to type anything secret. A client without
that support, like `--fixture` or a pipe, is refused immediately before anything opens — being
turned away *after* you have solved a CAPTCHA is the thing this is built to avoid.

There is also `demo.waitFor()`, which waits for a condition and prompts nobody: a push notification
approved on a phone, a link clicked in an email, a background job finishing. That one needs no
window and no terminal, so it works in CI.

**Output.** Every run produces one video, `demo.mp4`, plus `captions.srt`, `captions.vtt` and
`captions.ass` beside it. Captions are burned in with libass by default, because PlainTake
records silent video and no browser, Slack, X or LinkedIn renders an in-container caption
track — a selectable track would leave the narration invisible where demos actually get
watched. A licence can swap the burn-in for a `mov_text` track for the desktop players that do
render one.

Captions are white text on a slightly transparent dark plate, wrapped so the lines come out
roughly even rather than one full line and one stray word. The plate is there because
PlainTake mostly records light interfaces, where outlined text is hardest to read; measured on
the bundled example, the weakest part of an outlined caption had a local contrast of 25
against 170 for the plate.

**An optional mouse cursor.** `--cursor on` draws a pointer that glides between the
scenario's step targets and ripples where a step clicks — the ripple begins before the
screen change the click causes, so the press reads as the cause of what follows; the
default is off, and it is free
on every tier. The cursor is drawn at render time by libass from the recording's frozen
plan, exactly as the captions are, so a re-render reproduces it byte-for-byte — Playwright's
own action highlighting is deliberately unused, because it would inject frames that differ
between runs.

**A camera that zooms, on Pro.** `--camera zoom` eases the frame in on whatever each step
already targets — the same rects the cursor glides between — so the button being clicked
fills the screen instead of sitting in a corner of a full-page shot, and eases back out
again. The path is worked out from the recorded steps and frozen into the plan alongside the
captions, so two renders of one recording are still byte-identical and nothing about the
result was chosen by a model. It never decides *what* is worth looking at: a step with no
target moves nothing. Captions and the closing card are composited outside the crop and
never zoom, the video is still one 1920×1080 MP4 with exactly the frame count it had before,
and `off` — the default, on every tier — leaves the output byte-for-byte what it was.

**An evidence bundle, not just a file.** Each recording keeps the scenario source, the raw
capture, the Playwright trace, a semantic event timeline, the exact render plan, the toolchain
versions it was made with, and a SHA-256 manifest. `plaintake verify` re-checks every hash;
`plaintake inspect` reports what was produced.

**Reproducible rendering.** Re-rendering a frozen bundle produces byte-identical MP4s on the
same architecture and FFmpeg build, verified offline in a digest-pinned container with no
network at all.

**An MCP server.** Four tools — validate, run, render, verify — over stdio, sandboxed to a
workspace root, returning the same normalized results the CLI prints.

**A terminal UI.** `plaintake` with no arguments: record, browse recordings, settings,
licence, toolchain check. It starts only on a TTY, so an agent gets usage and a non-zero exit
rather than a prompt that blocks forever.

**Free and Pro.** Every recording, rendering and MCP feature works on the free tier, which
ends each video with a 3-second *Made with PlainTake* card. A one-time licence removes the
card, allows your own outro text and colours, and turns `demo.chapter()` calls into MP4 chapter
markers. Chapter events are recorded on **every** tier — only the markers are withheld — so
nothing is lost by recording on Free and activating later.

**Your output is yours** on both tiers, with no ownership claim and no restriction on selling
what you make.

### Known limitations

- Silent video with text subtitles. There is no audio and no text-to-speech.
- macOS arm64 and Linux x64 only. No Windows build, and no macOS Intel build.
- FFmpeg must be installed separately and **must have libass** — Homebrew's default `ffmpeg`
  does not.
- Chromium is downloaded once, separately, with `plaintake install-browser`.
- Chapter markers come only from `demo.chapter()`; they are never synthesised from step titles.
- The cursor is synthetic: one shape with click ripples, generated from step targets. It is
  not a recording of your real mouse, and `off` (the default) films no pointer at all.
- The camera only zooms, and only toward a rect a step already targets — no saliency, no
  scene detection, no planner. It is upscaled from the same 1920×1080 capture, so it is
  capped at 1.6×, and it costs render time. Unlike chapters, it cannot be added later by
  re-rendering: the shot list is frozen when the recording is made.
- **A `session` handoff is filmed.** There is no pause, no resume and nothing cut out, so a code
  the page shows in the clear while you work is in the finished video. `preflight` is the mode
  that avoids this, and it is the one to reach for. `demo.mask()` covers a field you name and
  nothing else — not a toast, not the URL bar.
- Handing the browser over needs a visible window and a terminal. It is refused with `--fixture`
  and in a pipe — and over MCP with a client that cannot relay a prompt. A recording made that
  way is not reproducible either — your timing
  is an input to it — though re-rendering the bundle afterwards is as reproducible as any other.
- A handoff opens a *headed* browser, which renders text on slightly different pixels than the
  headless one and requests `/favicon.ico`. An app without a favicon logs a 404 that fails the
  run; `logs/recorder.log` says so on every interactive run, and `allowedConsoleErrors` is where
  to silence it.
- Nothing prunes old recordings automatically. The Recordings panel deletes one when you ask.
