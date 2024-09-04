#! /usr/bin/env node
/* eslint-disable no-console */

import yargs from "yargs";
import fs from "fs-extra";
import path from "path";
import build from "@nebula.js/cli-build";
import sense from "@nebula.js/cli-sense";
import os from "os";

const args = yargs(process.argv.slice(2)).argv;
// const buildExt = args.ext;
const buildCore = args.core;
const mode = args.mode || "production";
// const watch = args.w;
const sourcemap = mode !== "production";

// cleanup old build
fs.removeSync(path.resolve(process.cwd(), "dist"));
fs.removeSync(path.resolve(process.cwd(), "core/esm"));

const buildArgs = {};

console.log("args", args);

function copyExt() {
  const targetPath = [
    os.homedir(),
    "Qlik",
    "Sense",
    "Extensions",
    "sn-shape-ext",
  ];
  if (os.platform() === "win32") {
    targetPath.splice(1, 0, "Documents");
  }

  const target = path.resolve(...targetPath);

  fs.copySync(path.resolve(process.cwd(), "sn-shape-ext"), target);
  console.log("Copied into Extensions folder!");
}

const buildExtension = async () => {
  console.log("---> BUILDING EXTENSION");
  await sense({ output: "sn-shape-ext", sourcemap });
  copyExt();
};

if (buildCore) {
  buildArgs.core = "core";
}

if (mode === "production") {
  buildArgs.sourcemap = false;
} else {
  buildArgs.mode = mode;
}

buildArgs.watch = true;

const main = async () => {
  console.log("---> BUILDING SUPERNOVA", buildArgs);
  buildArgs.typescript = true;
  const watcher = await build(buildArgs);
  buildExtension();
  watcher.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      buildExtension();
    }
  });
};

main();
