// Tiny chiptune sound engine built on the Web Audio API — no audio files.
// Sounds are synthesized from square-wave "beeps" for a retro, 8-bit feel.

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function beep(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "square",
  gain = 0.14
) {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

export type SoundName =
  | "correct"
  | "wrong"
  | "levelUp"
  | "coin"
  | "buy"
  | "click";

export function playSound(name: SoundName) {
  if (muted) return;
  switch (name) {
    case "correct":
      beep(660, 0, 0.09);
      beep(880, 0.08, 0.13);
      break;
    case "wrong":
      beep(200, 0, 0.16, "sawtooth", 0.13);
      beep(130, 0.09, 0.22, "sawtooth", 0.12);
      break;
    case "levelUp":
      beep(523, 0, 0.1);
      beep(659, 0.1, 0.1);
      beep(784, 0.2, 0.1);
      beep(1047, 0.3, 0.2);
      break;
    case "coin":
      beep(1200, 0, 0.05);
      beep(1600, 0.05, 0.09);
      break;
    case "buy":
      beep(880, 0, 0.06);
      beep(1320, 0.06, 0.1);
      break;
    case "click":
      beep(440, 0, 0.04, "square", 0.08);
      break;
  }
}
