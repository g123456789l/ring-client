import { RingApi } from "ring-client-api";
import { promisify } from "util";
import { readFile, writeFile } from "fs";

export function setupTokenRefresh(ringApi: RingApi) {
  ringApi.onRefreshTokenUpdated.subscribe(async ({ newRefreshToken, oldRefreshToken }) => {
    console.log("Refresh Token Updated: ", newRefreshToken);
    if (!oldRefreshToken) {
      return;
    }
    const currentConfig = await promisify(readFile)(".env"),
      updatedConfig = currentConfig
        .toString()
        .replace(oldRefreshToken, newRefreshToken);
    await promisify(writeFile)(".env", updatedConfig);
  });
}
