# Nick Berghane — live portfolio

A lightweight static portfolio with a clear professional front door, working browser-native proof, and a separate path into the experimental lab.

## Current structure

- `index.html` — professional homepage with a real one-file SHA-256 proof, interactive selected-project showcase, services, About section, optional systems map, and a locally saved project-brief flow
- `chronosaudit.html` — ChronosAudit v2: create local SHA-256 evidence manifests, preserve records in IndexedDB when available, detect duplicate bytes, load prior manifests, verify current files, classify matches/changes/moves/new/missing records, and export verification reports
- `archive/workspace-v1.html` — preserved copy of the previous all-in-one interactive workspace

## Working rule

A control either performs the operation it describes or the interface explicitly labels it as a prototype. Experimental work lives behind the Explore layer rather than crowding the primary professional path.

## Runtime notes

There is no build step. Serve the repository as static files in a normal secure browser context. Web Crypto performs hashing; IndexedDB provides optional local persistence; selected file contents are not uploaded or stored.
