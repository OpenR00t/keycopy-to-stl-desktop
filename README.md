# KeyCopy to STL

Desktop app (Tauri 2) that turns Flipper Zero Key Copier (`.keycopy`) files into printable, watertight STL keys.

## Build

```
cd src-tauri
cargo build --release
```

Output: `src-tauri/target/release/keycopy-to-stl.exe`. It's a single portable file that uses the system WebView2 runtime. On Windows you need Visual Studio Build Tools with the C++ workload.

For an installer with `.keycopy` file association: `cargo install tauri-cli --version "^2"`, then `cargo tauri build`.

## Changing the UI or geometry

1. Edit the files in `ui/`, then run `python ui/build.py`. This regenerates `dist/index.html`, which gets embedded in the executable.
2. Rebuild with cargo.

- `ui/core.js`: formats, `.keycopy` parser, cut maths, mesher, STL/DXF writers, print-orientation logic.
- `ui/ui.html`: the interface.
- `ui/wardings.min.json`: keyway cross-sections, in mm.
- `ui/vendor/`: Clipper 6.4.2, three.js r128, and the embedded fonts.
- `src-tauri/src/main.rs`: native dialogs and file I/O only.

## Print orientation

- **Face on the bed: Automatic** puts the face that best supports the teeth on the bed. For example, KW1 goes front-face down and Schlage goes back-face down.
- **Fill teeth gap up to (default 0.3 mm):** if the teeth still sit slightly above the bed, that recessed strip is filled so the teeth print from the first layer. KW1 needs 0.16 mm. Set it to 0 to disable.
- The app warns you when neither face reaches the teeth (Best/SFIC); those keys need supports or printing on edge.

## Credits

- Keyway profiles: ervanalb/keygen (CC0).
- Clipper: Angus Johnson (Boost licence).
- three.js: MIT licence.
- Barlow and Barlow Semi Condensed fonts (embedded in `ui/vendor/fonts.css`): SIL Open Font License 1.1.
- Specs cross-checked against T. J. Thomas, *Key Bitting Specifications* (2025).
- Master 1K spacing and depths: Master Lock Technical Manual (7000-0031), p. 25.
