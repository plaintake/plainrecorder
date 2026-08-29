# Sample output

From the `create-api-key` example, recorded against the bundled demo app — so you can
reproduce it yourself with nothing but a PlainTake install:

```bash
plaintake run create-api-key.demo.ts --output demo --fixture --subtitles hard
```

**Stills, captions and the manifest — not the video.** Four frames extracted from
`demo.mp4`, the standalone SRT, and the manifest. An MP4 here would add megabytes and
show nothing the frames do not.

| File | Shows |
|---|---|
| `create-api-key/01-settings.png` | The first narrated step, caption in the bottom safe area |
| `create-api-key/02-name-key.png` | Mid-demo, form filled |
| `create-api-key/03-secret-masked.png` | **A fake API key rendered as a solid dark block** |
| `create-api-key/04-outro-credit.png` | The free tier's closing credit card |
| `create-api-key/captions.srt` | The narration, with the timings PlainTake planned |
| `create-api-key/manifest.json` | A SHA-256 of every file, and the toolchain that made them |

## The one to look at

`03-secret-masked.png`. The demo app serves a fake key (`sk_test_0000…`) and the frame shows a
solid dark rectangle where it would have been.

That is the difference between a mask and a blur. The mask is registered by CSS selector
*before* the element exists, so it covers the secret in every frame it could have appeared in.
Nothing is removed after the fact, and there is no frame where the value was visible.

## How the captions look

White text on a dark plate, in the bottom safe area, wrapped so the lines come out roughly
even. The plate is there because PlainTake mostly records light interfaces, and outlined text
on a white page is hard to read no matter how thick the outline. It is slightly transparent,
so the page still shows through and the caption reads as part of the video.

Captions are burned into the pixels, which is what makes them show up in a browser, in Slack
and in a muted autoplay embed. A licence also lets you export a selectable caption track
instead, for desktop players.

## The closing card

`04-outro-credit.png` is the free tier's card: three seconds, centred, on near-black. A licence
removes it, or replaces it with your own text and colours.

Worth knowing where it comes from: the card is a field in the recording's frozen render plan,
decided once when the recording was made — not applied at render time. So re-rendering the same
recording produces the same bytes on any machine, licensed or not.

## Chapters are not shown here

A still cannot show them. Chapter markers are container metadata, not pixels: an MP4 with
chapters and one without decode to identical frames. To see them, record with a licence and
read them back:

```bash
ffprobe -v error -show_chapters demo/output/demo.mp4
```

These stills come from a **free tier** recording, so it has the credit card and no chapters.
