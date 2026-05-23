import { execSync } from 'node:child_process';
import type { ConfigContext, ExpoConfig } from 'expo/config';

// Dynamic Expo config. The static base lives in app.json; this layer injects
// git-derived version numbers so every build is versioned automatically with
// no EAS dependency. Runs in Node at config-evaluation time (expo start /
// prebuild / run).

const runGit = (command: string): string | null => {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
};

/** Monotonically increasing build number.
 *
 * CI sets `BUILD_NUMBER` (e.g. from `GITHUB_RUN_NUMBER`) so we don't depend on
 * a full git history being available on the runner. Local dev falls back to
 * the commit count, which keeps `expo start` and manual builds working without
 * any environment configuration. */
const getBuildNumber = (): number => {
  const fromEnv = process.env.BUILD_NUMBER;
  if (fromEnv !== undefined && fromEnv.length > 0) {
    const parsedEnv = Number.parseInt(fromEnv, 10);
    if (Number.isFinite(parsedEnv) && parsedEnv > 0) {
      return parsedEnv;
    }
  }
  const raw = runGit('git rev-list --count HEAD');
  const parsed = raw !== null ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

/** Latest git tag (leading `v` stripped); falls back to app.json's version when untagged. */
const getVersion = (fallback: string): string => {
  const tag = runGit('git describe --tags --abbrev=0');
  return tag !== null && tag.length > 0 ? tag.replace(/^v/, '') : fallback;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const buildNumber = getBuildNumber();
  const version = getVersion(config.version ?? '1.0.0');

  return {
    ...config,
    name: config.name ?? 'Recipely',
    slug: config.slug ?? 'recipely',
    version,
    ios: {
      ...config.ios,
      buildNumber: String(buildNumber),
    },
    android: {
      ...config.android,
      versionCode: buildNumber,
    },
  };
};
