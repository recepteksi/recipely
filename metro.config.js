const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Page co-location under presentation/app/ (see architecture.md): expo-router
// scans the app dir with a catch-all require.context, which would turn every
// co-located body/items/hooks/model/test file into a broken route. We swap the
// router's context module for our own, whose regex only admits real route
// files (index.tsx, _layout.tsx, +special, [param]).
const routeContext = path.resolve(__dirname, 'presentation/navigation/route-context.js');
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-router/_ctx') {
    return context.resolveRequest(context, routeContext, platform);
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
