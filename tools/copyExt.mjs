/* eslint-disable no-console */
import path from "path";
import os from "os";
import fs from "fs-extra";

function copyExt() {
  const targetPath = [
    os.homedir(),
    "Qlik",
    "Sense",
    "Extensions",
    "automl-expression-helper-ext",
  ];
  if (os.platform() === "win32") {
    targetPath.splice(1, 0, "Documents");
  }

  const target = path.resolve(...targetPath);

  fs.copySync(path.resolve(process.cwd(), "automl-expression-helper-ext"), target);
  console.log("Copied into Extensions folder!");
}

copyExt();

export default copyExt;
