import { PushNotificationAction, RingApi, Location } from "ring-client-api";
import { spawn } from "child_process";

export function handleRingEvents(ringApi: RingApi, locations: Location[], allCameras: any[]) {
  if (allCameras.length) {
    allCameras.forEach((camera: any) => {
      // Find location name for this camera
      const location = locations.find(loc => loc.cameras.some((cam: any) => cam.id === camera.id));
      const locationName = location ? location.name : "unknown";
      camera.onNewNotification.subscribe((notification: any) => {
        const action = notification.android_config.category,
          event =
            action === PushNotificationAction.Motion
              ? "Motion detected"
              : action === PushNotificationAction.Ding
              ? "Doorbell pressed"
              : `Video started (${action})`;

        const timestamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
        const filenamePrefix = `${timestamp}_${locationName}_${action}`;

        console.log(
          `${event} on ${camera.name} camera. Ding id ${
            notification.data.event.ding.id
          }.  Received at ${new Date()}`
        );

        // Spawn output-stream.ts with filenamePrefix
        spawn('ts-node', ['output-stream.ts', filenamePrefix], {
          stdio: 'inherit'
        });
      });
    });
    console.log("Listening for motion and doorbell presses on your cameras.");
  }
}
