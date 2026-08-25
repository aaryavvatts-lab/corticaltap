export type Electrode = {
  sub: string; name: string;
  x: number | null; y: number | null; z: number | null;
  attr: number;   // how much the model leaned on this contact (0..1)
  resp: number;   // measured high gamma change around a tap
  peak: number;   // peak of the tap locked curve in the first 0.8 s
};

export type ElectrodeFile = {
  bands: string[]; pre: number; post: number; hop_s: number;
  electrodes: Electrode[];
};

export type SubjectMeta = {
  n_steps: number; n_ch: number; n_bands: number; scale: number;
  channels: string[]; coords: (number | null)[][];
  taps: number[]; labels: number[]; duration: number; n_ch_total: number;
};

export type Manifest = { bands: string[]; hop_s: number; subjects: Record<string, SubjectMeta> };

export type Decoder = {
  w: number[]; b: number; mu: number[]; sd: number[];
  channels: string[]; holdout_acc: number;
};

const cache = new Map<string, unknown>();

async function once<T>(key: string, run: () => Promise<T>): Promise<T> {
  if (cache.has(key)) return cache.get(key) as T;
  const v = await run();
  cache.set(key, v);
  return v;
}

export const getElectrodes = () =>
  once<ElectrodeFile>("el", async () => (await fetch("/data/electrodes.json")).json());

export const getManifest = () =>
  once<Manifest>("man", async () => (await fetch("/data/signals/manifest.json")).json());

export const getDecoders = () =>
  once<Record<string, Decoder>>("dec", async () => (await fetch("/data/decoders.json")).json());

export const getResults = () =>
  once<any>("res", async () => (await fetch("/data/results.json")).json());

/** Tap locked high gamma curve for every electrode, in the same order as electrodes.json. */
export const getErp = () =>
  once<Float32Array>("erp", async () => {
    const b = await (await fetch("/data/erp.bin")).arrayBuffer();
    return new Float32Array(b);
  });

/** Band power for one patient, stored as int8 and scaled back on load. */
export async function getSignal(sub: string, meta: SubjectMeta) {
  return once<Float32Array>(`sig-${sub}`, async () => {
    const b = await (await fetch(`/data/signals/${sub}.bin`)).arrayBuffer();
    const raw = new Int8Array(b);
    const out = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw[i] / meta.scale;
    return out;
  });
}

/** How wrong the forecaster was at each moment. -1 marks steps with no history. */
export async function getError(sub: string) {
  return once<Float32Array>(`err-${sub}`, async () => {
    const b = await (await fetch(`/data/signals/${sub}_err.bin`)).arrayBuffer();
    return new Float32Array(b);
  });
}

export const at = (sig: Float32Array, meta: SubjectMeta, t: number, ch: number, band: number) =>
  sig[(t * meta.n_ch + ch) * meta.n_bands + band];

export const SUBJECT_IDS = Array.from({ length: 8 }, (_, i) => `sub-0${i + 1}`);

export const BAND_LABELS: Record<string, string> = {
  delta: "Delta 1-4 Hz",
  theta: "Theta 4-8 Hz",
  alpha: "Alpha 8-13 Hz",
  beta: "Beta 13-30 Hz",
  lgamma: "Low gamma 30-55 Hz",
  hgamma1: "High gamma 70-110 Hz",
  hgamma2: "High gamma 110-150 Hz",
};
