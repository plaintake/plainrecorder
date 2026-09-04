import { defineDemo } from '@plaintake/scenario';

/*
 * The quickstart tutorial video — PlainTake recording a guide to PlainTake.
 *
 * The terminal, the code viewer and the player are the static pages in ./pages, served by
 * ./serve.mjs (see README.md). The video the player embeds is the real output of the
 * example run inside `make quickstart-demo`, so the last stretch of this tutorial is the
 * exact artifact the taught command produces.
 *
 * The run records without camera zoom on purpose: at the zoom cap the framing window is
 * narrower than the code lines, and a tutorial that crops its own content is worse than
 * one that never zooms. Every step still declares its target, so the drawn pointer marks
 * the line being talked about.
 *
 * Every page change happens between steps, never inside a step's `run()`: the recorder
 * measures the step's target *before* `run()` starts, and a target that is not on the
 * current page yet costs a two-second probe timeout — and with it the pointer's glide to
 * that line, because an unmeasured rect is nowhere for the cursor to go. Navigating
 * between steps is what keeps each new page a clean cut.
 */

export default defineDemo({
  schema: 'agent-demo.scenario/v1',
  id: 'quickstart-demo',
  title: 'PlainTake quickstart',
  language: 'en',
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  locale: 'en-US',
  timezoneId: 'UTC',
  colorScheme: 'light',
  reducedMotion: 'reduce',

  intro: {
    lines: ['PlainTake quickstart', 'install → run → demo.mp4'],
    narration: 'Script in, video out — the whole loop in one minute.',
    durationMs: 2_500,
  },

  async preflight({ page, baseURL }) {
    for (const path of [
      '/install.html',
      '/scenario.html',
      '/validate.html',
      '/run.html',
      '/watch.html',
      '/bundle.html',
    ]) {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
    }
    // The player page fetches the example video as a blob and seeks it to the stretch the
    // tutorial shows; wait until that is done so the first filmed frame is the paused one.
    await page.goto(`${baseURL}/watch.html`, { waitUntil: 'load' });
    // The flag is set by watch.html's untyped page script once the embedded video has
    // seeked; the cast is the only DOM-lib-visible trace of that handshake.
    await page.waitForFunction(
      () => (window as { __demoReady?: boolean }).__demoReady === true,
      undefined,
      { timeout: 30_000 },
    );
  },

  async warmup({ page, baseURL }) {
    await page.goto(`${baseURL}/install.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
  },

  async run({ page, demo, baseURL }) {
    await demo.chapter('Install');

    await demo.step({
      id: 'download-install',
      title: 'Download and install',
      subtitle: 'Download the tarball and run the installer.',
      target: page.getByRole('button', { name: 'curl -LO' }),
      action: 'point',
      holdMs: 2_600,
      run: () => Promise.resolve(),
    });

    await demo.step({
      id: 'doctor',
      title: 'Check the toolchain',
      subtitle: 'plaintake doctor checks FFmpeg and Chromium.',
      target: page.getByRole('button', { name: 'plaintake doctor' }),
      action: 'click',
      holdMs: 2_400,
      run: () => page.getByRole('button', { name: 'plaintake doctor' }).click(),
    });

    await page.goto(`${baseURL}/scenario.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await demo.chapter('Write the scenario');

    await demo.step({
      id: 'scenario-file',
      title: 'A demo is a TypeScript file',
      subtitle: 'Define steps, captions and chapters with defineDemo.',
      target: page.locator('#ln-define'),
      action: 'point',
      holdMs: 2_400,
      run: () => Promise.resolve(),
    });

    await demo.step({
      id: 'assert-outcome',
      title: 'Assert the outcome',
      subtitle: 'Declare an assert — a wrong end state fails the run.',
      target: page.locator('#ln-assert'),
      action: 'point',
      holdMs: 2_400,
      run: () => Promise.resolve(),
    });

    await demo.step({
      id: 'step-anatomy',
      title: 'Declare each step',
      subtitle: 'A step names its target and action: click or type.',
      target: page.locator('#ln-step'),
      action: 'point',
      holdMs: 2_600,
      run: () => Promise.resolve(),
    });

    await page.goto(`${baseURL}/validate.html`, { waitUntil: 'load' });
    await demo.chapter('Validate');

    await demo.step({
      id: 'validate',
      title: 'Validate before recording',
      subtitle: 'One command checks the scenario before filming.',
      target: page.getByRole('button', { name: 'plaintake validate' }),
      action: 'click',
      holdMs: 2_400,
      run: () => page.getByRole('button', { name: 'plaintake validate' }).click(),
    });

    await demo.assert({
      id: 'validate-ok',
      title: 'Validation output is visible',
      run: () => page.getByText('validate ok:').waitFor({ state: 'visible' }),
    });

    await page.goto(`${baseURL}/run.html`, { waitUntil: 'load' });
    await demo.chapter('Record');

    await demo.step({
      id: 'run-command',
      title: 'One command records',
      subtitle: 'Point plaintake run at the scenario and your app.',
      target: page.getByRole('button', { name: 'plaintake run' }),
      action: 'click',
      holdMs: 2_400,
      run: () => page.getByRole('button', { name: 'plaintake run' }).click(),
    });

    await demo.step({
      id: 'rendered',
      title: 'The run writes demo.mp4',
      subtitle: 'Chromium records; FFmpeg renders the film.',
      target: page.getByText('1080p30'),
      action: 'point',
      holdMs: 2_200,
      run: () => page.getByText('1080p30').waitFor({ state: 'visible' }),
    });

    await page.goto(`${baseURL}/watch.html`, { waitUntil: 'load' });
    await page.waitForFunction(
      () => (window as { __demoReady?: boolean }).__demoReady === true,
      undefined,
      { timeout: 30_000 },
    );

    await demo.step({
      id: 'watch-output',
      title: 'Watch the actual output',
      subtitle: 'This is the exact file the run wrote.',
      target: page.getByRole('button', { name: 'Play the recorded demo' }),
      action: 'click',
      holdMs: 6_500,
      run: () => page.getByRole('button', { name: 'Play the recorded demo' }).click(),
    });

    await demo.assert({
      id: 'segment-played',
      title: 'The recorded segment played',
      run: async () => {
        const at = await page.evaluate(() => document.querySelector('video')?.currentTime ?? 0);
        // The player seeks to 7.5 s (the review page) and plays through the approval; past
        // 10 s means the Approve click and the approved card really played on camera.
        if (at <= 10) throw new Error(`example video only reached ${at.toFixed(1)}s`);
      },
    });

    await page.goto(`${baseURL}/bundle.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await demo.chapter('The bundle');

    await demo.step({
      id: 'bundle-tree',
      title: 'More than a video',
      subtitle: 'Captions, a manifest and a trace ship beside the MP4.',
      target: page.locator('#row-vtt'),
      action: 'point',
      holdMs: 2_400,
      run: () => Promise.resolve(),
    });

    await demo.step({
      id: 'verify',
      title: 'Prove it later',
      subtitle: 'Verify re-checks every artifact against the manifest.',
      target: page.getByRole('button', { name: 'plaintake verify' }),
      action: 'click',
      holdMs: 2_400,
      run: () => page.getByRole('button', { name: 'plaintake verify' }).click(),
    });

    await demo.step({
      id: 'whole-loop',
      title: 'That is the whole loop',
      subtitle: 'Install, write, validate, run — then ship the video.',
      target: page.locator('#row-demo'),
      action: 'point',
      holdMs: 2_600,
      run: () => Promise.resolve(),
    });
  },
});
