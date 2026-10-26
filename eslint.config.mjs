import { createRequire } from "module";

const require = createRequire(import.meta.url);
const next = require("eslint-config-next");

const config = {
  ...next,
};

// Flat config doesn't support the "extends" key
delete config.extends;

export default [
  config,
  {
    ignores: [".next/**", "node_modules/**", "db/migrations/**"],
  },
];
