import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import * as fs from "fs";
import * as dotenv from "dotenv";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from "url";
import { argv } from "process";

const dir = path.dirname(fileURLToPath(import.meta.url)).replace(/\\/g, "/");
const arg = argv.length > 2 ? argv[2] : undefined;

const dotEnvPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(dotEnvPath)) {
  const result = dotenv.config();
  if (result.error)
    throw result.error;
}

const envVars = JSON.stringify({
  CLIENT_ID: process.env.CLIENT_ID,
  SCOPES: process.env.SCOPES,
  ITWIN_ID: process.env.ITWIN_ID,
  IMODEL_ID: process.env.IMODEL_ID,
  BING_KEY: process.env.BING_KEY,
});

esbuild
  .build({
    format: "esm",
    entryPoints: ["src/index.ts"],
    watch: arg === "--watch" ? true : false,
    bundle: true,
    minify: true,
    sourcemap: true,
    define: { global: "window", __dirname: `"${dir}"`, ENV: envVars },
    outfile: "public/dist/bundle.js",
    plugins: [new NodeGlobalsPolyfillPlugin(), new NodeModulesPolyfillPlugin()],
    loader: {
      ".svg": "dataurl",
      ".woff": "dataurl",
      ".eot": "dataurl",
      ".ttf": "dataurl",
      ".woff2": "dataurl",
      ".cur": "dataurl",
    },
  })
  .catch(() => process.exit(1));
