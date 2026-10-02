let () =
  if Sys.ocaml_version <> "5.5.1" then
    failwith ("Unexpected compiler version: " ^ Sys.ocaml_version);
  let worker = Domain.spawn (fun () -> 21 * 2) in
  if Domain.join worker <> 42 then failwith "Domain test failed";
  let value = [1; 2; 3] in
  let restored : int list = Marshal.from_string (Marshal.to_string value []) 0 in
  if restored <> value then failwith "Marshal test failed";
  if Unix.getpid () <= 0 then failwith "Unix library test failed";
  Printf.printf "OCaml %s: compiler, domains, Marshal and Unix OK\n%!"
    Sys.ocaml_version
