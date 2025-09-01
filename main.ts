import { RingApi } from "ring-client-api";
import { handleRingEvents } from "./ring-events";

import { setupTokenRefresh } from "./utils/tokenRefresh";

export async function main() {
  const { env } = process,
    ringApi = new RingApi({
      refreshToken: env.RING_REFRESH_TOKEN!,
      debug: true,
    }),
    locations = await ringApi.getLocations(),
    allCameras = await ringApi.getCameras();

  console.log(
    `Found ${locations.length} location(s) with ${allCameras.length} camera(s).`
  );

  setupTokenRefresh(ringApi);

  // Print location and device info
  for (const location of locations) {
    let haveConnected = false;
    location.onConnected.subscribe((connected) => {
      if (!haveConnected && !connected) {
        return;
      } else if (connected) {
        haveConnected = true;
      }
      const status = connected ? "Connected to" : "Disconnected from";
      console.log(`**** ${status} location ${location.name} - ${location.id}`);
    });
  }

  for (const location of locations) {
    const cameras = location.cameras,
      devices = await location.getDevices();

    console.log(
      `\nLocation ${location.name} (${location.id}) has the following ${cameras.length} camera(s):`
    );
    for (const camera of cameras) {
      console.log(`- ${camera.id}: ${camera.name} (${camera.deviceType})`);
    }

    console.log(
      `\nLocation ${location.name} (${location.id}) has the following ${devices.length} device(s):`
    );
    for (const device of devices) {
      console.log(`- ${device.zid}: ${device.name} (${device.deviceType})`);
    }
  }

  handleRingEvents(ringApi, locations, allCameras);
}
