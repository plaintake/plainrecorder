import { defineDemo } from '@plaintake/scenario';

export default defineDemo({
  schema: 'agent-demo.scenario/v1',
  id: 'release-0-2-0',
  title: 'PlainTake 0.2.0 release approval',
  language: 'en',
  handoff: 'session',
  handoffTimeoutMs: 30_000,
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  locale: 'en-US',
  timezoneId: 'UTC',
  colorScheme: 'light',
  reducedMotion: 'reduce',

  /*
   * The opening card. `durationMs` is a floor: recorded with `--speech on` the narration is
   * what sets the length, and this only keeps the card up long enough to read when the run
   * is silent.
   */
  intro: {
    lines: ['PlainTake 0.2.0', 'release approval'],
    narration: 'Here is how a release gets approved, in about half a minute.',
    durationMs: 2_500,
  },

  async preflight({ page, baseURL }) {
    for (const path of [
      '/demo/releases',
      '/demo/releases/new',
      '/demo/releases/review',
      '/demo/releases/approved',
    ]) {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
    }
  },

  async run({ page, demo, baseURL }) {
    await demo.step({
      id: 'open-release-desk',
      title: 'Open the release desk',
      subtitle: 'Start with the release workspace in a real browser.',
      holdMs: 1_800,
      run: async () => {
        await page.goto(`${baseURL}/demo/releases`, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
      },
    });

    await demo.step({
      id: 'prepare-release',
      title: 'Prepare release 0.2.0',
      subtitle: 'The synthetic pointer moves to each declared target.',
      target: page.getByRole('link', { name: 'Prepare release' }),
      action: 'click',
      holdMs: 1_800,
      run: async () => {
        await page.getByRole('link', { name: 'Prepare release' }).click();
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
      },
    });

    await demo.step({
      id: 'enter-version',
      title: 'Enter the release version',
      subtitle: 'Camera zoom follows the same target rectangle.',
      target: page.getByLabel('Version'),
      action: 'type',
      holdMs: 1_700,
      run: () => page.getByLabel('Version').fill('0.2.0'),
    });

    await demo.step({
      id: 'request-approval',
      title: 'Request approval',
      subtitle: 'Submit the release for a final human decision.',
      target: page.getByRole('button', { name: 'Request approval' }),
      action: 'click',
      holdMs: 2_200,
      run: async () => {
        await page.getByRole('button', { name: 'Request approval' }).click();
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
      },
    });

    await demo.step({
      id: 'frame-human-review',
      title: 'Frame the human review',
      subtitle: 'PlainTake hands the visible browser to a person.',
      target: page.getByRole('button', { name: 'Approve 0.2.0' }),
      action: 'point',
      holdMs: 1_400,
      run: () => page.getByRole('button', { name: 'Approve 0.2.0' }).waitFor({ state: 'visible' }),
    });

    await demo.handoff({
      id: 'human-approval',
      title: 'Review and approve release 0.2.0',
      detail: 'Check the version and notes, then confirm the decision.',
    });

    await demo.step({
      id: 'approve-release',
      title: 'Approve release 0.2.0',
      subtitle: 'The person approves, and the recorded scenario can continue.',
      target: page.getByRole('button', { name: 'Approve 0.2.0' }),
      action: 'click',
      holdMs: 2_400,
      run: async () => {
        await page.getByRole('button', { name: 'Approve 0.2.0' }).click();
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
      },
    });

    await demo.assert({
      id: 'approval-visible',
      title: 'The human approval is visible',
      run: () => page.getByRole('heading', { name: 'Release 0.2.0 is approved.' }).waitFor({ state: 'visible' }),
    });

    await demo.step({
      id: 'show-approved-state',
      title: 'Show the approved release',
      subtitle: 'The final state is visible and ready to verify.',
      target: page.getByRole('link', { name: 'Return to releases' }),
      action: 'point',
      holdMs: 2_200,
      run: () => Promise.resolve(),
    });
  },
});
