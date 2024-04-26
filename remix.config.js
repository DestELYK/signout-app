/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/*.css"],
  serverModuleFormat: "esm",
  browserNodeBuiltinsPolyfill: { modules: { timers: true } },
  serverMinify: true,
  serverDependenciesToBundle: [
    "/^remix-utils.*/",
  ]
};
