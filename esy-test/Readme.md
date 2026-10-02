# Compiler smoke tests

Run `esy-package` from the repository root. It supplies the locally generated
compiler package through a temporary registry before running this consumer.

Both `ocamlc` and `ocamlopt` compile `smoke.ml`. The resulting programs verify
OCaml 5.5.1, spawn and join a domain, round-trip a marshaled value, and call Unix.
The bytecode run also exercises loading the Unix runtime stubs.
