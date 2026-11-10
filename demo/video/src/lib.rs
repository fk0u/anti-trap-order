//! Video demo Anti Trap Order (ATO) untuk lomba MIT-Week UNMUL 2026.
//!
//! Naskah per adegan: `demo/NASKAH.md`. Layar di video adalah screenshot asli aplikasi
//! (`media/*.png`, dibuat oleh `demo/shots.cjs` dan `demo/shots-soul.cjs`, data fiktif).
//! Tanpa suara: narasi dan musik diisi di luar video. Tidak ada skor, persen, atau klaim
//! deteksi pasti; kalimat privasi hanya yang sudah ada di aplikasi (S-01, S-16).
use fframes::{
    AnimateRuntimeInput, AudioMap, AudioTimestamp::{Eof, Second}, AudioTrack, Color, Duration, FFramesContext, Frame, Overlap, Scene, Scenes,
    Svgr, Transform, Video,
    animation::{AnimationRuntime, Easing},
    include_media_dir,
};
use std::sync::LazyLock;

include_media_dir!(pub struct VideoProjMedia, "media");

pub const WIDTH: usize = 1920;
pub const HEIGHT: usize = 1080;

const FONT: &str = "DM Sans";
const WEIGHT: u16 = 500;
const INK: &str = "#0b1b2a";
const MUTED: &str = "#41586b";
const LITE: &str = "#0e7490";
const SOUL: &str = "#b45309";

// Layar ponsel di kanan: 390x844 pt, gambar sumber 780 px lebar.
const PHONE_X: f32 = 1180.0;
const PHONE_Y: f32 = 72.0;
const PHONE_W: f32 = 430.0;
const PHONE_H: f32 = 930.0;
const SRC_W: f32 = 780.0;

#[derive(Clone, Copy, PartialEq)]
enum Tone {
    Lite,
    Soul,
    Neutral,
}

#[derive(Clone, Copy, PartialEq)]
enum Extra {
    None,
    Hook,
    Privacy,
    Closing,
}

/// Satu screenshot di dalam adegan. `h` = tinggi gambar sumber (px, lebar 780).
struct Shot {
    file: &'static str,
    h: f32,
    from: f32,
    to: f32,
    /// Halaman panjang: digulir dari atas ke bawah antara (pan.0, pan.1) detik.
    pan: Option<(f32, f32)>,
}

struct Spec {
    name: &'static str,
    /// Durasi adegan di video (detik).
    secs: f32,
    /// Durasi yang dipakai saat menyusun waktu screenshot/gulir di `shots`; diskalakan ke `secs`.
    base: f32,
    kicker: &'static str,
    lines: &'static [&'static str],
    tone: Tone,
    extra: Extra,
    shots: &'static [Shot],
}

const fn shot(file: &'static str, h: f32, from: f32, to: f32, pan: Option<(f32, f32)>) -> Shot {
    Shot { file, h, from, to, pan }
}

static SPECS: &[Spec] = &[
    Spec {
        name: "Masalah",
        secs: 10.0,
        base: 12.0,
        kicker: "SETIAP HARI",
        lines: &["Terasa janggal.", "Tapi di mana", "celahnya?"],
        tone: Tone::Neutral,
        extra: Extra::Hook,
        shots: &[],
    },
    Spec {
        name: "Pengantar",
        secs: 13.0,
        base: 13.0,
        kicker: "A20 CULTURE TECHNOLOGY",
        lines: &["Jangan hanya waspada.", "Jadilah penjaganya."],
        tone: Tone::Lite,
        extra: Extra::None,
        shots: &[shot("01-landing.png", 1688.0, 0.0, 13.0, None)],
    },
    Spec {
        name: "Situasi",
        secs: 14.0,
        base: 15.0,
        kicker: "A20 LITE · 3 MENIT",
        lines: &["Tanpa login.", "Tanpa data pribadi."],
        tone: Tone::Lite,
        extra: Extra::None,
        shots: &[shot("03-situasi.png", 1688.0, 0.0, 15.0, None)],
    },
    Spec {
        name: "Mode Pelaku",
        secs: 17.0,
        base: 25.0,
        kicker: "A20 LITE · MODE PELAKU",
        lines: &["Jadi pelakunya", "selama 30 detik."],
        tone: Tone::Lite,
        extra: Extra::None,
        shots: &[
            shot("04-q1.png", 1688.0, 0.0, 8.8, None),
            shot("04-q2.png", 1688.0, 8.4, 17.0, None),
            shot("04-q3.png", 1688.0, 16.6, 25.0, None),
        ],
    },
    Spec {
        name: "Hasil",
        secs: 13.0,
        base: 20.0,
        kicker: "A20 LITE · HASIL",
        lines: &["Kamu yang", "menemukan celahnya."],
        tone: Tone::Lite,
        extra: Extra::None,
        shots: &[shot("05-hasil.png", 3914.0, 0.0, 20.0, Some((3.0, 18.0)))],
    },
    Spec {
        name: "Action Card",
        secs: 12.0,
        base: 15.0,
        kicker: "A20 LITE · ACTION CARD",
        lines: &["Bawa ini", "bersamamu."],
        tone: Tone::Lite,
        extra: Extra::None,
        shots: &[shot("06-action.png", 2840.0, 0.0, 15.0, Some((3.0, 13.0)))],
    },
    Spec {
        name: "Soul",
        secs: 17.0,
        base: 30.0,
        kicker: "A20 SOUL · THE GUARDIAN ARC",
        lines: &["Jaga seseorang", "lewat cerita."],
        tone: Tone::Soul,
        extra: Extra::None,
        shots: &[
            shot("07a-soul-karakter.png", 1688.0, 0.0, 5.6, None),
            shot("07b-soul-misi1.png", 1712.0, 5.2, 10.6, None),
            shot("07c-soul-konsekuensi1.png", 1848.0, 10.2, 17.6, Some((12.0, 16.5))),
            shot("07d-soul-ringkasan.png", 2260.0, 17.2, 30.0, Some((20.0, 28.0))),
        ],
    },
    Spec {
        name: "Privasi",
        secs: 16.0,
        base: 20.0,
        kicker: "BATASAN & PRIVASI",
        lines: &["Kami tidak menyimpan", "apa yang kamu tulis."],
        tone: Tone::Lite,
        extra: Extra::Privacy,
        shots: &[shot("08-privasi.png", 3244.0, 0.0, 20.0, Some((4.0, 18.5)))],
    },
    Spec {
        name: "Mode Terbatas",
        secs: 13.0,
        base: 18.0,
        kicker: "SERVER MATI? TETAP LANJUT",
        lines: &["Hasilnya dibuat", "di perangkatmu."],
        tone: Tone::Lite,
        extra: Extra::None,
        shots: &[
            shot("09-offline-sheet.png", 1688.0, 0.0, 8.0, None),
            shot("05-hasil.png", 3914.0, 7.6, 18.0, Some((9.0, 17.0))),
        ],
    },
    Spec {
        name: "Penutup",
        secs: 10.0,
        base: 12.0,
        kicker: "MIT-WEEK UNMUL 2026 · GUARDIANS OF THE DIGITAL SPACE",
        lines: &["Anti Trap Order"],
        tone: Tone::Neutral,
        extra: Extra::Closing,
        shots: &[],
    },
];

const TOTAL_SECONDS: f32 = 135.0; // jumlah `secs` semua adegan
/// Narasi mulai sedikit setelah adegan dimulai.
const VO_DELAY: f32 = 0.8;

static EASE: LazyLock<AnimationRuntime> = LazyLock::new(|| AnimationRuntime::new(0.7, &Easing::EaseOut));
static SPRING: LazyLock<AnimationRuntime> = LazyLock::new(|| {
    AnimationRuntime::new(3.0, &Easing::Spring { mass: 1.0, stiffness: 170.0, damping: 20.0 })
});

/// 0 sampai 1 selama 0,7 dtk mulai `start` (detik dalam adegan).
fn ramp(frame: &Frame, start: f32) -> f32 {
    frame.animate_runtime(AnimateRuntimeInput { on_second: start, from: 0.0, to: 1.0, animation_runtime: &EASE })
}

/// Offset vertikal: pegas dari `from` px ke 0 mulai `start`.
fn rise(frame: &Frame, start: f32, from: f32) -> f32 {
    frame.animate_runtime(AnimateRuntimeInput { on_second: start, from, to: 0.0, animation_runtime: &SPRING })
}

fn smooth(x: f32) -> f32 {
    let x = x.clamp(0.0, 1.0);
    x * x * (3.0 - 2.0 * x)
}

pub struct VideoProjVideo<'a> {
    pub media: &'a VideoProjMedia,
    beats: Vec<Beat>,
    /// (nama file, detik mulai) voice-over tiap adegan.
    vo: Vec<(String, f32)>,
}

impl<'a> VideoProjVideo<'a> {
    pub fn new(media: &'a VideoProjMedia, _title: &str) -> Self {
        let mut at = 0.0;
        let vo = SPECS
            .iter()
            .enumerate()
            .map(|(i, spec)| {
                let entry = (format!("vo-{:02}.wav", i + 1), at + VO_DELAY);
                at += spec.secs;
                entry
            })
            .collect();
        Self { media, beats: SPECS.iter().map(|spec| Beat { spec }).collect(), vo }
    }
}

impl std::fmt::Debug for VideoProjVideo<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("VideoProjVideo").finish()
    }
}

impl Video for VideoProjVideo<'_> {
    const FPS: usize = 30;
    const WIDTH: usize = WIDTH;
    const HEIGHT: usize = HEIGHT;
    const BACKGROUND_COLOR: Color = Color::WHITE;

    fn duration(&self) -> Duration<'_> {
        Duration::Auto
    }

    fn audio(&self) -> AudioMap<'_> {
        // Voice-over per adegan (demo/narasi.json → scripts/voiceover-macos.sh atau voiceover.mjs).
        AudioMap::from(
            self.vo
                .iter()
                .map(|(file, start)| AudioTrack::new(file.as_str(), Second(*start)..Eof).voice())
                .collect::<Vec<_>>(),
        )
    }

    fn define_scenes(&self) -> Scenes<'_> {
        Scenes::from(self.beats.iter().map(|b| b as &dyn Scene).collect::<Vec<_>>())
    }

    fn render_frame<'a>(&'a self, frame: Frame, ctx: &FFramesContext<'a, '_>) -> Svgr<'a> {
        let progress = (frame.seconds() / TOTAL_SECONDS * 1620.0).clamp(0.5, 1620.0);
        fframes::svgr!(
            <svg xmlns="http://www.w3.org/2000/svg" width={WIDTH} height={HEIGHT} viewBox="0 0 1920 1080">
                <rect width="1920" height="1080" fill="#f4fbfe" />
                {ctx.render_scenes(&frame)}
                <rect x="150" y="1046" width="1620" height="4" rx="2" fill="#0b1b2a" opacity="0.12" />
                <rect x="150" y="1046" width={progress} height="4" rx="2" fill={LITE} />
            </svg>
        )
    }
}

#[derive(Debug)]
struct Beat {
    spec: &'static Spec,
}

impl std::fmt::Debug for Spec {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.name)
    }
}

impl Scene for Beat {
    fn duration(&self) -> Duration<'_> {
        Duration::Seconds(self.spec.secs)
    }

    fn name(&self) -> &'static str {
        self.spec.name
    }

    fn overlap(&self) -> Overlap {
        Overlap::None
    }

    fn render_frame<'a>(&'a self, frame: Frame, ctx: &FFramesContext<'a, '_>) -> Svgr<'a> {
        let spec = self.spec;
        let t = frame.seconds();
        let accent = if spec.tone == Tone::Soul { SOUL } else { LITE };
        let (sky_a, sky_b) = match spec.tone {
            Tone::Lite => ("#c9f3fb", "#f4fbfe"),
            Tone::Soul => ("#ffe98c", "#fff9e0"),
            Tone::Neutral => ("#e4f6fb", "#f4fbfe"),
        };
        let has_phone = !spec.shots.is_empty();
        let left = has_phone || spec.extra == Extra::Hook;
        let text_x = if left { 150.0 } else { 960.0 };
        let anchor = if left { "start" } else { "middle" };
        let line_start = if spec.extra == Extra::Privacy { 330.0 } else { 440.0 };

        let lines: Vec<Svgr> = spec
            .lines
            .iter()
            .enumerate()
            .map(|(i, line)| {
                let start = 0.35 + i as f32 * 0.18;
                let size = if spec.extra == Extra::Closing { 150 } else { 92 };
                let y = if spec.extra == Extra::Closing { 640.0 } else { line_start + i as f32 * 112.0 };
                fframes::svgr!(<text x={text_x} y={y + rise(&frame, start, 46.0)} font-size={size} letter-spacing="-2" fill={INK} text-anchor={anchor} opacity={ramp(&frame, start)}>{*line}</text>)
            })
            .collect();

        let phone = if has_phone { self.phone(&frame, ctx, accent) } else { Svgr::empty() };
        let extra = match spec.extra {
            Extra::Hook => self.hook(&frame),
            Extra::Privacy => self.privacy(&frame, accent),
            Extra::Closing => self.closing(&frame, accent),
            Extra::None => Svgr::empty(),
        };
        let kicker_y = if spec.extra == Extra::Closing { 860.0 } else if spec.extra == Extra::Privacy { 230.0 } else { 330.0 };
        let kicker_size = if spec.extra == Extra::Closing { 30 } else { 34 };
        // Tanpa overlap: tiap adegan memudar masuk/keluar lewat latar yang sama (tanpa kedip).
        let env = smooth(t / 0.5).min(smooth((spec.secs - t) / 0.5));

        fframes::svgr!(<g font-family={FONT} font-weight={WEIGHT} opacity={env}>
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color={sky_a} />
                    <stop offset="1" stop-color={sky_b} />
                </linearGradient>
            </defs>
            <rect width="1920" height="1080" fill="url(#sky)" />
            <text x={text_x} y={kicker_y} font-size={kicker_size} letter-spacing="6" fill={accent} text-anchor={anchor} opacity={ramp(&frame, 0.1)}>{spec.kicker}</text>
            {lines}
            {extra}
            {phone}
        </g>)
    }
}

impl Beat {
    /// Ponsel dengan screenshot; halaman panjang digulir, beberapa screenshot bergantian.
    fn phone<'a>(&'a self, frame: &Frame, ctx: &FFramesContext<'a, '_>, accent: &'a str) -> Svgr<'a> {
        let t = frame.seconds() * self.spec.base / self.spec.secs;
        let scale = PHONE_W / SRC_W;
        let last = self.spec.shots.len() - 1;
        let shots: Vec<Svgr> = self
            .spec
            .shots
            .iter()
            .enumerate()
            .filter_map(|(i, s)| {
                let fade_in = if i == 0 { 1.0 } else { smooth((t - s.from) / 0.5) };
                let fade_out = if i == last { 1.0 } else { 1.0 - smooth((t - (s.to - 0.5)) / 0.5) };
                let opacity = fade_in * fade_out;
                if opacity <= 0.001 {
                    return None;
                }
                let ih = s.h * scale;
                let dy = match s.pan {
                    Some((a, b)) if ih > PHONE_H => -(ih - PHONE_H) * smooth((t - a) / (b - a)),
                    _ => 0.0,
                };
                let href = ctx.get_image(s.file)?.href();
                Some(fframes::svgr!(<image href={href} x={PHONE_X} y={PHONE_Y + dy} width={PHONE_W} height={ih} opacity={opacity} />))
            })
            .collect();
        let enter = rise(frame, 0.0, 140.0);
        fframes::svgr!(<g opacity={ramp(frame, 0.0)} transform={Transform::translate(0, enter)}>
            <defs>
                <clipPath id="screen"><rect x={PHONE_X} y={PHONE_Y} width={PHONE_W} height={PHONE_H} rx="46" /></clipPath>
            </defs>
            <rect x={PHONE_X + 10.0} y={PHONE_Y + 12.0} width={PHONE_W} height={PHONE_H} rx="46" fill="#0b1b2a" />
            <g clip-path="url(#screen)">
                <rect x={PHONE_X} y={PHONE_Y} width={PHONE_W} height={PHONE_H} fill="#ffffff" />
                {shots}
            </g>
            <rect x={PHONE_X} y={PHONE_Y} width={PHONE_W} height={PHONE_H} rx="46" fill="none" stroke="#0b1b2a" stroke-width="4" />
            <rect x={PHONE_X + 20.0} y={PHONE_Y + PHONE_H + 22.0} width="120" height="8" rx="4" fill={accent} opacity="0.0" />
        </g>)
    }

    /// Adegan 1: tiga potongan pesan fiktif muncul seperti chat, satu per satu.
    fn hook(&self, frame: &Frame) -> Svgr<'_> {
        let msgs = ["Dicari admin input data, Rp500rb/hari.", "Daftar hari ini, kuota terbatas.", "Biaya seragam Rp150rb."];
        let bubbles: Vec<Svgr> = msgs
            .iter()
            .enumerate()
            .map(|(i, m)| {
                let start = 0.9 + i as f32 * 1.6;
                let w = 90.0 + m.len() as f32 * 17.0;
                let y = 250.0 + i as f32 * 150.0;
                fframes::svgr!(<g opacity={ramp(frame, start)} transform={Transform::translate(rise(frame, start, 90.0), 0)}>
                    <rect x="980" y={y} width={w} height="100" rx="30" fill="#ffffff" stroke="#0b1b2a" stroke-width="2.5" />
                    <text x="1020" y={y + 63.0} font-size="34" fill={INK}>{*m}</text>
                </g>)
            })
            .collect();
        fframes::svgr!(<g>
            {bubbles}
            <text x="980" y="800" font-size="30" letter-spacing="3" fill={MUTED} opacity={ramp(frame, 5.4)}>"CONTOH PESAN (FIKTIF)"</text>
        </g>)
    }

    /// Adegan privasi: alur teks → disamarkan → dianalisis → dibuang (fakta K12, sama dengan S-16).
    fn privacy(&self, frame: &Frame, accent: &'static str) -> Svgr<'_> {
        let steps = ["Teks kamu", "Disamarkan di perangkatmu", "Dianalisis", "Langsung dibuang"];
        let items: Vec<Svgr> = steps
            .iter()
            .enumerate()
            .map(|(i, label)| {
                let start = 2.0 + i as f32 * 1.4;
                let x = 150.0 + i as f32 * 0.0;
                let y = 640.0 + i as f32 * 92.0;
                let last = i == steps.len() - 1;
                let fill = if last { accent } else { "#ffffff" };
                let ink = if last { "#ffffff" } else { INK };
                fframes::svgr!(<g opacity={ramp(frame, start)} transform={Transform::translate(rise(frame, start, 40.0), 0)}>
                    <rect x={x} y={y - 54.0} width="700" height="72" rx="36" fill={fill} stroke="#0b1b2a" stroke-width="2.5" />
                    <text x={x + 42.0} y={y - 6.0} font-size="36" fill={ink}>{*label}</text>
                </g>)
            })
            .collect();
        fframes::svgr!(<g>{items}</g>)
    }

    /// Penutup: logo A→Ω, disclaimer, nama tim.
    fn closing(&self, frame: &Frame, accent: &'static str) -> Svgr<'_> {
        let line = (ramp(frame, 0.3) * 440.0).max(0.5);
        fframes::svgr!(<g>
            <g opacity={ramp(frame, 0.0)} transform={Transform::translate(0, rise(frame, 0.0, 60.0))}>
                <circle cx="720" cy="330" r="64" fill="#ffffff" stroke="#0b1b2a" stroke-width="4" />
                <text x="720" y="352" font-size="64" fill={INK} text-anchor="middle">"A"</text>
                <rect x="800" y="326" width={line} height="8" rx="4" fill={accent} />
                <circle cx="1280" cy="330" r="64" fill="#ffffff" stroke="#0b1b2a" stroke-width="4" />
                <path d="M-22 22 H-8 C-28 10 -32 -4 -32 -14 C-32 -33 -18 -44 0 -44 C18 -44 32 -33 32 -14 C32 -4 28 10 8 22 H22" transform="translate(1280 330)" fill="none" stroke={INK} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <text x="960" y="760" font-size="42" fill={MUTED} text-anchor="middle" opacity={ramp(frame, 1.6)}>"Ini alat bantu berpikir, bukan deteksi pasti."</text>
            <text x="960" y="950" font-size="52" letter-spacing="8" fill={INK} text-anchor="middle" opacity={ramp(frame, 3.0)}>"TIM CALON CEO"</text>
        </g>)
    }
}
