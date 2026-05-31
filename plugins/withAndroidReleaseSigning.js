const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Injects a Play Store-ready release signing config into the Android
 * `app/build.gradle` during `expo prebuild`.
 *
 * The committed `android/` directory is git-ignored and regenerated on every
 * CI run, so signing cannot live in a hand-edited gradle file — this plugin
 * re-applies it each prebuild. The actual key material is supplied at build
 * time through Gradle project properties (set from CI secrets in
 * `android/gradle.properties`):
 *
 *   RECIPELY_UPLOAD_STORE_FILE, RECIPELY_UPLOAD_STORE_PASSWORD,
 *   RECIPELY_UPLOAD_KEY_ALIAS, RECIPELY_UPLOAD_KEY_PASSWORD
 *
 * When those properties are absent (local dev, anyone without the keystore),
 * release builds fall back to the debug keystore exactly as the Expo template
 * does — so prebuild never breaks for contributors. The patch is idempotent.
 */
const STORE_FILE_PROP = 'RECIPELY_UPLOAD_STORE_FILE';

const RELEASE_SIGNING_CONFIG = `
        release {
            if (project.hasProperty('${STORE_FILE_PROP}')) {
                storeFile file(RECIPELY_UPLOAD_STORE_FILE)
                storePassword RECIPELY_UPLOAD_STORE_PASSWORD
                keyAlias RECIPELY_UPLOAD_KEY_ALIAS
                keyPassword RECIPELY_UPLOAD_KEY_PASSWORD
            }
        }`;

const CONDITIONAL_RELEASE_SIGNING =
  `signingConfig project.hasProperty('${STORE_FILE_PROP}') ` +
  '? signingConfigs.release : signingConfigs.debug';

/** Add a `release {}` entry to the `signingConfigs {}` block (once). */
function addReleaseSigningConfig(contents) {
  if (contents.includes('release {\n            if (project.hasProperty')) {
    return contents;
  }
  const debugBlock = /(signingConfigs \{\n\s*debug \{[\s\S]*?\n\s*\})/;
  return contents.replace(debugBlock, `$1${RELEASE_SIGNING_CONFIG}`);
}

/** Point the `release` build type at the keystore when one is provided. */
function useReleaseSigning(contents) {
  if (contents.includes(CONDITIONAL_RELEASE_SIGNING)) {
    return contents;
  }
  return contents.replace(
    /signingConfig signingConfigs\.debug\n(\s*def enableShrinkResources)/,
    `${CONDITIONAL_RELEASE_SIGNING}\n$1`,
  );
}

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        'withAndroidReleaseSigning expected a Groovy build.gradle.',
      );
    }
    let contents = cfg.modResults.contents;
    contents = addReleaseSigningConfig(contents);
    contents = useReleaseSigning(contents);
    cfg.modResults.contents = contents;
    return cfg;
  });
};
