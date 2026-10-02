const path = require("node:path");

// The first argument locates the pinned, globally installed esy-package.
const packageRoot = process.argv.splice(2, 1)[0];
if (!packageRoot) throw new Error("Expected the esy-package installation path");

if (process.platform === "win32") {
  // esy-package 0.1.0-dev.60 calls cygpath -u before extracting with Node's
  // fs/tar-fs APIs. Those APIs require Windows paths, not MSYS /d/... paths.
  // cygpath is only used by archive extraction in this pinned version.
  const utils = require(path.join(packageRoot, "js/lib/utils.js"));
  utils.cygpath = async (filePath) => filePath;
}

require(path.join(packageRoot, "js/bin/main.js"));
