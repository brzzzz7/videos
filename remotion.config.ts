/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// The OffthreadVideo cache defaults to half the free memory, which is enough
// to get the compositor OOM-killed on a small box. Keep it bounded.
Config.setOffthreadVideoCacheSizeInBytes(300 * 1024 * 1024);
Config.setConcurrency(2);

// Point at an already-installed Chromium instead of downloading one
// (needed in sandboxes without access to Remotion's browser CDN).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
