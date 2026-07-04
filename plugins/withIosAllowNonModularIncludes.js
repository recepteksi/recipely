const { withPodfile } = require('@expo/config-plugins');

/**
 * Sets `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` on every
 * Pods target via the Podfile's `post_install` hook during `expo prebuild`.
 *
 * `@react-native-firebase` pods build as framework modules (app.json sets
 * `useFrameworks: "static"`, which Firebase requires) but include non-modular
 * React-Core headers, which clang rejects with
 * `-Werror,-Wnon-modular-include-in-framework-module` on release builds.
 * The `ios/` directory is git-ignored and regenerated on every CI run, so the
 * fix cannot live in a hand-edited Podfile — this plugin re-applies it each
 * prebuild. The patch is idempotent.
 */
const POST_INSTALL_PATCH = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end`;

/** Append the build-setting loop to the `post_install` block (once).
 *
 * Throws if the `post_install do |installer|` anchor is gone (Expo template
 * drift) rather than silently shipping a Podfile that fails the iOS release
 * build only deep inside xcodebuild. */
function addAllowNonModularIncludes(contents) {
  if (contents.includes(POST_INSTALL_PATCH)) {
    return contents;
  }
  const anchor = /(post_install do \|installer\|)/;
  if (!anchor.test(contents)) {
    throw new Error(
      'withIosAllowNonModularIncludes: post_install anchor not found — ' +
        'the Expo iOS Podfile template may have changed.',
    );
  }
  return contents.replace(anchor, `$1${POST_INSTALL_PATCH}`);
}

module.exports = function withIosAllowNonModularIncludes(config) {
  return withPodfile(config, (cfg) => {
    cfg.modResults.contents = addAllowNonModularIncludes(
      cfg.modResults.contents,
    );
    return cfg;
  });
};
