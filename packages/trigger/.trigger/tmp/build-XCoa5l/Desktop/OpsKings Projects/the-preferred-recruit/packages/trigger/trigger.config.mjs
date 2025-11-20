import {
  defineConfig
} from "../../../../../chunk-WZUARXKA.mjs";
import "../../../../../chunk-WGZVSTIN.mjs";
import {
  init_esm
} from "../../../../../chunk-3R76H35D.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_fwlmfzysfaxqxfycqxrd",
  runtime: "node",
  logLevel: "info",
  // 60 minutes (3600 seconds)
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2
    }
  },
  dirs: ["./src/tasks"],
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
