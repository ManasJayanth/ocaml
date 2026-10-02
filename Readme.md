![Build and test the esy
package](https://github.com/ManasJayanth/ocaml/actions/workflows/workflow.yml/badge.svg)

# ocaml

`ocaml` is the [`ocaml`](https://github.com/ocaml/ocaml) compiler packaged for [`esy`](https://esy.sh/).

## Why
`esy` can not only fetch and install Reason and OCaml libraries and tools,
but also those written in C. This extends reproducibility benefits to
packages written in C, like `skia`, `libffi`, `pkg-config`
etc. Users don't have to install them separately, nor have to worry if
they have installed the correct version. Read more at the docs about
[benefits for opting for esy packages](https://esy.sh/docs/what-why/).

## How to use `ocaml`?

`ocaml` packages can be consumed from NPM or from a GitHub repository that
contains a buildable esy package. This repository contains a packaging recipe;
see the note below before using it as a GitHub dependency.

### From NPM

`ocaml` is deployed on NPM can be found
[here](https://www.npmjs.com/package/ocaml).

You can simply run `esy add ocaml` to install it, or specify it in
`package.json` and run `esy`.

```diff
{
  "dependencies": {
+   "ocaml": "*"
  }
}
```

### Directly from Github

The following examples explain esy’s GitHub dependency syntax. For this
recipe repository, first generate the package with `esy-package` and use
the local package or publish it to npm as described below. Pointing esy
at this recipe checkout does not substitute for generating the package.

```json
{
  "dependencies": {
    "ocaml": "ManasJayanth/ocaml"
  }
}
```

i.e. `<GITHUB_ORG or USERNAME>/<REPO NAME>`

To use a specific commit,

```diff
  "dependencies": {
+   "ocaml": "<GITHUB_ORG or USERNAME>/<REPO NAME>#<commit hash>"
  }
```

## How to package for esy?

### For the experienced

**The gist**
Specify the configure and build commands in `esy.build` property of
`esy.json` and the install step in `esy.install`. If the package
builds "in source", set `esy.buildsInSource` property to `true`. Use
`$cur__install` environment variable to set the install location.

See [docs](https://esy.sh/docs/configuration/) for reference.

The CI will take care of fetching the sources and creating an NPM
package for you. See the [CI workflow](.github/workflows/workflow.yml) and
[packaging wrapper](.github/run-esy-package.cjs) to see how it is invoked.

In this repository, `esy-package` reads `source` and `override` in `esy.json`
and writes the `esy` configuration into the generated package manifest.

You can download the package from the CI artifacts. Publishing can also be
automated in CI, but this repository currently leaves publishing to a maintainer.

### For beginners

> Note: you'll need Node.js for this tutorial. If you're experienced
> with bash, you can use it instead.

Fundamentally, packaging for esy works like in other Linux distros,
except ofcourse, such that packages become available on MacOS and
Windows too.

You would typically have to specify the instructions to build the
package in the `esy.json`. For example, everyone's favourite http
tool, [curl](https://curl.se/), needs the following instructions ([as
described on their website](https://curl.se/docs/install.html))

```sh
./configure
make
make install
```

Many packages have similar instructions!

Configure and build steps are specified in the `esy.build` property in
the `esy.json` and install steps in `esy.install`. Example,

```json
{
  "esy": {
    "build": [
	  "./configure",
	  "make"
	],
	"install": [
	  "make install"
	]
  }
}
```


## Testing and making sure the package works as expected

To test if the package works, we recommend an end-to-end test by
publishing it to local
[`verdaccio`](https://github.com/verdaccio/verdaccio), and using the
package with a `package.json` or `esy.json` that depends on it.

```json
{
  "dependencies": {
    "ocaml": "*"
  }
}
```

With Verdaccio running and the package published there, point `esy` to the
local npm registry (use the port configured for your Verdaccio instance):

```sh
esy i --npm-registry http://localhost:4873
esy b
```

If the package is a library, it's a good idea to write a small program
to actually check if the library works. Refer to how the
corresponding package is tested in Homebrew or Arch Linux for examples.

Check out the [consumer test manifest](esy-test/package.json) and
[smoke test](esy-test/smoke.ml) for reference; these are used by CI.

## OCaml 5.5.1 package workflow

The recipe pins the upstream OCaml 5.5.1 source archive and its SHA-256 checksum.
The following commands apply to this release.

### Build and test the package

Use Node.js 22 (the packaging tool's dependencies are incompatible with Node.js
26), esy, and the platform's C compiler and `make`:

```sh
npm install -g esy@0.9.2 esy-package@0.1.0-dev.60
node .github/run-esy-package.cjs "$(npm root -g)/esy-package"
```

This creates `package.tar.gz`, publishes it to a temporary local Verdaccio
registry, and installs and builds it through esy. It does not publish to npmjs.org.
The consumer in `esy-test/` compiles and runs both bytecode and native programs,
checking the compiler version, multicore domains, marshaling, and the Unix
library. CI runs this on macOS, Linux, and Windows.
Run these commands in Bash (Git Bash on Windows). The wrapper works around an
archive-extraction path bug in the pinned `esy-package` on Windows; other
platforms use the tool unchanged.

To generate only the source package:

```sh
node .github/run-esy-package.cjs "$(npm root -g)/esy-package" package
```

Windows builds fetch FlexDLL 0.44 and let the OCaml build bootstrap it. The
compiler builds from source when installed; `package.tar.gz` is not a prebuilt
binary distribution.

### Use the local package

Extract the generated archive somewhere outside this recipe checkout:

```sh
mkdir -p /tmp/ocaml-5.5.1-package
tar -xzf package.tar.gz -C /tmp/ocaml-5.5.1-package
```

Then use that extracted package as the compiler in an esy project:

```json
{
  "dependencies": {
    "ocaml": "file:/tmp/ocaml-5.5.1-package/package"
  }
}
```

Run `esy`, then `esy ocamlc -version` or `esy ocamlopt -version`.
The repository itself contains a packaging recipe, so use the generated package
rather than pointing an esy compiler dependency at the recipe checkout.

### Publish and consume from npm

After reviewing the tarball and CI results, a maintainer with access to the
`ocaml` npm package can publish it:

```sh
npm publish ./package.tar.gz --registry https://registry.npmjs.org
```

Once published, consumers can depend on the release as follows:

```json
{
  "dependencies": {
    "ocaml": "5.5.1"
  }
}
```

The source of truth is `esy.json`. When updating a release, change its version,
source URL, and SHA-256 together, then update the version in
`esy-test/package.json` and `esy-test/smoke.ml` and rerun `esy-package`.
