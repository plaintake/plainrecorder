# How the landing-page video was taken

The demo video on [plaintake.github.io](https://plaintake.github.io) — a release being
prepared, submitted for approval, handed to a person, and approved — was recorded by
PlainTake itself, from the scenario in this folder. Nothing was screen-recorded, edited, or
re-taken. This page is the whole recipe: the scenario, the command, and what each part of it
bought, so you can point the same machinery at your own product.

## The scenario

[`release-0.2.0.demo.ts`](release-0.2.0.demo.ts) is the exact source that ran. It is a plain
PlainTake scenario: six steps, one `demo.handoff()`, one `demo.assert()`. Two numbers in it
are worth reading correctly:

- **`0.2.0` is the demo app's release, not PlainTake's version.** The app in the video is
  releasing version 0.2.0 of itself; the scenario types that number into the form.
- **The `intro` block is in the scenario but not in the published video.** The run opened
  with the title card it declares (`PlainTake 0.2.0 / release approval`). The published
  video starts directly on the app instead, because a landing page has about a second of
  attention. The card was dropped afterwards by re-deriving the timestamps from the
  recording's frozen render plan — the capture itself was untouched, so the flow you see is
  frame-for-frame the recording. (Every run ships that plan in its evidence bundle — see
  [the guide](../README.md).)

## The command

The app in the video is a small release-approval app with the four routes the scenario's
`preflight` warms. It was served standalone and passed with `--base-url`:

```sh
plaintake run docs/site-demo/release-0.2.0.demo.ts \
  --output release-demo \
  --base-url http://127.0.0.1:PORT \
  --subtitles soft --cursor on --camera zoom --speech on
```

What each flag contributed:

- `--cursor on` — the pointer that glides to each step's declared `target` and ripples on
  click. Drawn in post from the declared targets; the recording never moves a real mouse
  except during the handoff.
- `--camera zoom` (Pro) — the frame easing in on whatever each step already targets.
- `--subtitles soft` (Pro) — a selectable caption track rather than burned-in text.
- `--speech on` (Pro) — the narration, synthesised locally; no API key, nothing leaves the
  machine.

Drop the three Pro flags and the same scenario records on the Free tier — burned-in
captions, pointer, and the closing `Made with PlainTake` card, no narration and no zoom.

## Why not `--fixture`

The bundled demo app (`--fixture`) serves these very routes, but the recording could not
use it: the scenario declares `handoff: 'session'`, and PlainTake refuses that combination
before opening a browser. A handoff hands a *visible* browser to a person mid-recording,
while the fixture path exists for the runs nobody is watching — that separation is what
keeps `plaintake verify` reproducible. So an app with routes like these is started on its
own port, and `--base-url` points the run at it.

## The handoff is real

At the `demo.handoff()` call, the terminal asks a question and waits. A person confirms,
the recording pauses on the visible browser, and the approve click that follows is theirs —
captured as it happened, with a 30-second timeout (`handoffTimeoutMs`) that fails the run
rather than recording an idle page. In the published video this is the stretch where the
pointer waits at the *Approve 0.2.0* button before the click.

## The closing card

The video ends on `Made with PlainTake / plaintake.github.io`. That is the Pro outro with
custom branding configured for this recording; the Free tier closes with the standard
`Made with PlainTake` card, and a Pro licence with branding disabled closes with nothing.

## Run it against your app

Copy the scenario, change the `preflight` routes and the steps' targets to your own pages
and selectors, and check it with `plaintake validate` before recording. If your flow needs
a person — a login, an approval, a judgement call — declare the handoff where this one
does, run the command in a terminal you can see, and take the browser when it asks.
