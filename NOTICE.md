# Third-party notices

PlainTake is proprietary software — see [`LICENSE`](LICENSE). Going closed source
does **not** discharge the obligations owed to the components it ships, vendors, or
invokes. Those are recorded here.

None of this is legal advice. Have the licence and these notices reviewed before a
commercial launch.

## Playwright — Apache License 2.0

**Redistributed.** The shipped binary cannot bundle Playwright, because
`playwright-core` reads real files from disk at runtime (`browsers.json`,
`webp_codec.wasm`, `xdg-open`, `trace-viewer/`) and a Node SEA cannot `require` from the
filesystem. So `playwright` and `playwright-core` are **vendored beside the executable**
and loaded from there.

That makes attribution mandatory rather than incidental: Apache-2.0 §4 requires the
licence, the copyright notice, and any `NOTICE` file to travel with the distribution.
The install tarball therefore ships `vendor/playwright-core/LICENSE` and
`vendor/playwright-core/NOTICE` unmodified.

Chromium is **not** redistributed. `plaintake install-browser` fetches it onto the
user's machine via Playwright's own installer. Chromium carries its own licences
(primarily BSD-3-Clause plus the licences of its bundled components).

## Noto Sans — SIL Open Font License 1.1

**Redistributed.** `assets/fonts/NotoSans-Regular.ttf` ships with the product; the
renderer pins fontconfig to it so a host font can never win, which is what makes caption
rendering deterministic.

OFL 1.1 permits bundling in a commercial, closed-source product. Two conditions apply
and both are met:

- the full licence text travels with the font — `assets/fonts/OFL.txt`;
- the font is **not modified**, so the Reserved Font Name restriction is not engaged. If
  it is ever modified, it must be renamed.

OFL also forbids selling the font *by itself*. Bundling it inside this product is not
that. Source: <https://github.com/notofonts/notofonts.github.io> (hinted static TTF).
The file's SHA-256 is pinned in `assets/fonts/checksums.txt`.

## FFmpeg — GPL, and deliberately not redistributed

FFmpeg is **not shipped with the product**. It is invoked as a separate executable that
the user installs themselves, and the two communicate only through a process boundary
and files.

This matters commercially. The builds this project targets are configured with
`--enable-gpl` and `--enable-libx264`, which makes those binaries **GPL-licensed**.
Because PlainTake never links FFmpeg — it spawns it with an argument array and reads
its output — the GPL applies to the FFmpeg binary the user installed, not to
PlainTake. Keeping it that way is a licensing requirement, not a design preference:
**do not vendor, bundle, or statically link FFmpeg or libx264 into the shipped binary.**

One exception to be aware of: the canonical container image (`docker/Dockerfile`)
installs FFmpeg via apt. **Distributing that image redistributes GPL binaries** and
carries the corresponding GPL obligations for FFmpeg itself. The image is a
reproducibility harness, not a product artefact; if it is ever published, comply
accordingly.

## H.264 / AVC patents

Output MP4 files use the H.264/AVC video codec via libx264.

**"Free software" does not mean "patent-free."** H.264 is covered by patents administered
through a patent pool. Distributing an H.264 encoder or decoder, or distributing H.264
content commercially, may carry licensing obligations depending on jurisdiction and
scale of use. PlainTake deliberately:

- does not bundle, vendor, or redistribute an FFmpeg or libx264 binary;
- keeps FFmpeg a separately installed external executable;
- makes no representation that any particular use is patent-unencumbered.

Selling software that produces H.264 output raises this question more sharply than
giving it away did. Review the obligations before launch.

## Gumroad

Licence keys are issued and validated by Gumroad. Activating a paid licence makes one
request to Gumroad's public licence-verify endpoint; no API key or access token is used,
and no credential is stored. Recording and rendering never contact Gumroad or anything
else — see [`docs/licensing.md`](docs/licensing.md).

## MCP SDK, Zod, and the toolchain

`@modelcontextprotocol/sdk` (MIT) and `zod` (MIT) are shipped inside the bundled binary.
Their licence texts travel with the distribution.

Node.js, pnpm, TypeScript, Vitest, ESLint, esbuild and dependency-cruiser are build- and
test-time only and are not redistributed, save for the Node runtime embedded in the
single-executable build (Node is MIT-licensed, and its own notices ship with it). Exact
versions are pinned in `package.json` and `pnpm-lock.yaml`.
