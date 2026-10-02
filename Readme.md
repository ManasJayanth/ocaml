# OCaml for esy

[OCaml](https://github.com/ocaml/ocaml) **5.5.1**, packaged for
[esy](https://esy.sh/). The recipe in `esy.json` pins the upstream release
archive and verifies its SHA-256 checksum. `esy-package` combines those sources,
the build recipe, and the Windows helper in `files/` into an npm source package.

## Build and test the package

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

Windows builds fetch FlexDLL 0.43 and let the OCaml build bootstrap it. The
compiler builds from source when installed; `package.tar.gz` is not a prebuilt
binary distribution.

## Use the local package

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

## Publish and consume from npm

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
