import { meet } from '@googleworkspace/meet-addons';

export async function dismissMeetSpinner(cloudProjectNumber?: string) {
  if (!cloudProjectNumber) return;
  try {
    console.log(`[Meet Addon Loader] Initializing Meet Addon SDK for project: ${cloudProjectNumber}...`);
    const session = await meet.addon.createAddonSession({
      cloudProjectNumber
    });
    if (meet.addon.getFrameType() === 'MAIN_STAGE') {
      await session.createMainStageClient();
      console.log("[Meet Addon Loader] MainStageClient initialized successfully. Spinning loader removed!");
    }
  } catch (e) {
    console.error("[Meet Addon Loader] Failed to initialize Meet Addon SDK:", e);
  }
}
