# Changelog

`scripts/release.sh` reads the section for the version being released and uses it as the
GitHub release notes, so this file is the source of what a customer reads — not a summary
written afterwards.

## 1.0.0

This is the release where a PlainTake video talks.

**Spoken narration.** Pro recordings can use `--speech on` to read every caption aloud with a
voice model that runs on your own machine — Kokoro-82M through onnxruntime, 24 kHz mono, no
network, no account and no API key. `plaintake install-voice` fetches the weights once and checks
every byte against a digest committed in the build; nothing on the recording or rendering path
opens a socket afterwards. The captions are the script, so there is no second copy of the words to
drift out of step with the screen, and each caption stays up for as long as the audio it was given
rather than for a reading-rate estimate. Word timestamps from the model also let long captions be
split at real word boundaries instead of by character weight, so captions come out better synced
with narration on than without it.

**Your own voice instead.** `narration/<stepId>.wav` beside the scenario file speaks that step in
whatever voice you recorded — a human voiceover, or a cloud voice you already pay for — without
PlainTake ever holding a credential. `--speech on` synthesises only the lines you have not voiced;
`--speech file` synthesises nothing at all and refuses a step with no file, rather than quietly
reading it in the model's voice. The clips and the mixed track are frozen into the bundle and
hashed like every other artifact, so re-rendering a narrated recording needs no voice model and
reproduces the same MP4. `--voice` chooses among 28 English voices; `doctor` reports which are
installed, and does not fail if none are.

**The voice works from the installed build.** The speech engine — the pronunciation dictionary,
the inference worker and the ONNX Runtime native library — now ships inside the tarball, beside
the binary in the same way Playwright already did, because a Node single executable cannot carry
a native library inside itself. So `plaintake install-voice` and `--speech on` work from an
installed `plaintake` rather than only from a source checkout. The build proves it rather than
assuming it: it loads the native binding from the staged install tree with the interpreter that
ships beside it, and fails if more than one platform's library is present, if a licence text is
missing, or if the tarball is about to carry a model cache.

**Click ripples land before the UI change, including on clicks that navigate** — which the
first version of this got wrong. A ripple is now timed from the step's own start rather than from
the moment the step's `run()` returned, because a `run()` that clicks a link does not return until
the page it opened has loaded: on scenarios of that shape the ring used to be drawn a second or
more after the screen had already changed, over a button that was no longer on it. Measured on the
release demo, the three ripples now lead their screen changes by 211–323 ms and fade out across
them.

**Smaller things.** `plaintake inspect` reports a bundle's narration — clip count, spoken length,
how much of it is your own audio, and which voice read the rest — and `doctor` reports whether
the voice model is installed and which voices you have, without failing when you have none. A run
that asks for `--speech on` with nothing installed and no `narration/` directory now stops before
the browser starts, instead of recording first and failing at the first line it had to speak.
Two more fixes found while building the above: the constant-frame-rate check read the container's
duration rather than the video stream's, so a narrated bundle could be refused for a difference
that was only its audio track being longer; and re-rendering a frozen bundle now creates the
output directory it writes into, which git cannot track when empty and which made the canonical
x86-64 reproducibility check fail on a fresh clone.

### Known limitations

- Narration is Pro-only in both modes, including `--speech file`: what a licence unlocks is the
  audio track in the video, not the voice model. Like the camera it is frozen while recording, so
  a silent bundle cannot be re-rendered into a narrated one. The pronunciation dictionary is US
  English only, so a non-English scenario gets captions and no voice. A narrated video is longer
  than the same scenario recorded silent, because each step waits for its line to finish.
- The bundled speech engine makes the download bigger for everyone, including people who never
  record a narrated demo, because there is one tarball per platform: measured on macOS arm64, the
  download goes from 81.3 MB to 93.9 MB and the installation from 247 MB to 292 MB. The voice
  model itself is still a separate ~93 MB download that only happens if you ask for it.
- Reproducible *rendering* of a narrated bundle is verified offline in the digest-pinned
  container, with the audio decoded back out of the MP4 and checked. Offline *synthesis* is not
  verified there — it would need a voice model and a licence inside the image — so that claim
  rests on the host runs instead.

## 0.2.0

This release adds a camera that follows declared step targets and makes human approval a
first-class part of a recorded browser flow.

**Target-driven camera.** Pro recordings can use `--camera zoom` to ease toward the same
rectangles already declared for steps and the synthetic cursor. The shot list is computed in
TypeScript and frozen into the render plan, so FFmpeg executes literal crop geometry and a
re-render stays byte-identical on the same architecture and FFmpeg build. The camera never
chooses what to show: steps without targets do not move it. Captions and closing cards remain
outside the crop, and `--camera off` preserves the full viewport.

**Smoother motion.** Camera transitions now use an 800 ms cosine ease with even-pixel
intermediate crop geometry, avoiding visible zoom rungs while keeping yuv420p-compatible
frames and exact held endpoints. Cursor safety shifts the crop without changing its zoom,
which prevents a moving pointer from causing the frame to pulse.

**Human-in-the-loop recording.** A scenario can declare `handoff: 'preflight'` to let a person
sign in or solve a challenge before recording and tracing begin, or `handoff: 'session'` when
the decision belongs in the demo itself. The visible browser is handed to the person; the
prompt returns only a completion choice, never credentials or codes. Interactive recordings
omit the Playwright trace so account fields, cookies, and request bodies are not bundled.
Clients that support MCP elicitation can relay the completion prompt in chat; other clients
are refused before Chromium starts.

**Cursor and click feedback.** The optional synthetic pointer continues to be rendered from
the frozen step targets, now framed by the same camera path. Click ripples land before the UI
change so the action reads as the cause of the transition.

**New release demo.** The public demo now walks through preparing version 0.2.0, requesting a
human review, approving it in the visible browser, and returning to the verified final state.
It is an 18-second, 1920×1080, 30 fps H.264 video with hard captions and no audio.

### Known limitations

- The camera is Pro-only, capped at 1.6×, and its shot list is frozen while recording; it
  cannot be added later to a camera-less bundle by re-rendering.
- A `session` handoff is filmed exactly as it happens. Use `preflight` for authentication that
  should appear in neither the video nor the trace.
- Interactive timing is a human input, so the capture is not reproducible; re-rendering the
  resulting frozen bundle remains reproducible under the usual toolchain constraints.

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
