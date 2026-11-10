# Video Proj

A 1920x1080 @ 30 fps video made with [fframes](https://github.com/dmtrKovalenko/fframes),
rendered with the Skia (Metal) backend.

| file | what |
| --- | --- |
| `src/lib.rs` | the video: scenes, animation, audio map |
| `src/main.rs` | the command line (`fframes::cli`) |
| `build.rs` | lets the executable find the shared engine and Rust runtime |
| `media/` | fonts, images and audio embedded into the binary |

## Work on it

Standalone projects enable incremental compilation for release builds. Use `--release`
throughout editing so CPU rendering, scene code and GPU preparation keep release optimization.
The first build warms the cache; subsequent edits reuse it. Keep Cargo features and the target
directory consistent between checks. The profile uses 16 codegen units, the usual release
count, instead of the larger incremental default. Existing workspace projects configure
profiles in their workspace-root `Cargo.toml`.

If a frame panics, rerun the command with `RUST_BACKTRACE=1` to see the functions on the
stack. Release builds carry no debug info, which keeps the binaries small and the links short.

On macOS and Linux with a dynamic C runtime, the default `dynamic-linking` feature lets
Cargo reuse the linked fframes engine after a scene edit. For an executable you can move
away from the build directory and Rust toolchain, build with
`cargo build --release --no-default-features` to link the Rust libraries into the executable.

```sh
cargo run --release -- timeline                      # scenes, duration, audio tracks
cargo run --release -- frame 1s,50%,end              # PNGs into frames/ and the problems found in them
cargo run --release -- strip 0..2s -n 8        # contact sheet, writes strip.png
cargo run --release -- onion "0..1.5s"  # motion trail of an entrance, writes onion.png
cargo run --release -- inspect                       # missing media/fonts, clipped text, panics in any frame
cargo run --release -- render 0..2s --draft    # a part of the video, half resolution, fast preset
cargo run --release -- audio analyze --waveform w.png  # loudness (LUFS), peaks, silence per scene
cargo run --release -- render                        # the final video, writes out.mp4
cargo run --release -- preview                       # real-time GPU window with sound (space, h/l, j/k, q)
```

Times accept frames (`120`), seconds (`3.2s`), `m:ss`, percentages (`50%`), scenes (`DataScene`,
`#1`) and offsets inside scenes (`DataScene@1.5s`, `@50%`, `@end`). Add `--json` to any
command for machine-readable output.
