# Changelog

`scripts/release.sh` reads the section for the version being released and uses it as the
GitHub release notes, so this file is the source of what a customer reads — not a summary
written afterwards.

## 0.1.0

First release.

**Recording.** A committed TypeScript scenario drives a real Chromium through Playwright and
produces a narrated video. Steps, waits, masks and chapters are declared in the scenario; no
recording is done by hand and no take is edited.

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
- Nothing prunes old recordings automatically. The Recordings panel deletes one when you ask.
