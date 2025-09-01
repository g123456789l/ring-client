import { PushNotificationAction, RingApi } from "ring-client-api";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import { spawn } from "child_process";

async function main() {
  const { env } = process,
    ringApi = new RingApi({
      refreshToken: env.RING_REFRESH_TOKEN!,
      debug: true,
    }),
    allCameras = await ringApi.getCameras();

  ringApi.onRefreshTokenUpdated.subscribe(
    async ({ newRefreshToken, oldRefreshToken }) => {
      if (!oldRefreshToken) return;
      const currentConfig = await promisify(readFile)(".env"),
        updatedConfig = currentConfig
          .toString()
          .replace(oldRefreshToken, newRefreshToken);
      await promisify(writeFile)(".env", updatedConfig);
    }
  );

  if (allCameras.length) {
    allCameras.forEach((camera) => {
      camera.onNewNotification.subscribe((notification) => {
        const action = notification.android_config.category;
        if (action === PushNotificationAction.Motion) {
          console.log(
            `Motion detected on ${camera.name} camera. Starting stream for 30 seconds.`
          );
          // Call output-stream.ts (duration handled in output-stream.ts)
          const child = spawn("ts-node", ["output-stream.ts"], {
            stdio: "inherit",
            shell: true,
          });
        }
      });
    });
    console.log("Listening for motion events on your cameras.");
  }
}

main();
