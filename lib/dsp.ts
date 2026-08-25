/* Small signal helpers. Everything here runs on the visitor's own machine. */

/** Radix-2 FFT, in place, on split real and imaginary arrays. */
export function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br; im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

export const nextPow2 = (n: number) => { let p = 1; while (p < n) p <<= 1; return p; };

/** One sided power spectrum of a windowed segment. */
export function spectrum(x: number[] | Float32Array, fs: number) {
  const n = nextPow2(x.length);
  const re = new Float64Array(n), im = new Float64Array(n);
  let mean = 0;
  for (let i = 0; i < x.length; i++) mean += x[i];
  mean /= Math.max(1, x.length);
  for (let i = 0; i < x.length; i++) {
    // Hann window keeps leakage from smearing peaks across neighbouring bins
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (x.length - 1 || 1));
    re[i] = (x[i] - mean) * w;
  }
  fft(re, im);
  const half = n >> 1;
  const power = new Float64Array(half), freq = new Float64Array(half);
  for (let i = 0; i < half; i++) {
    power[i] = (re[i] * re[i] + im[i] * im[i]) / (x.length * x.length);
    freq[i] = (i * fs) / n;
  }
  return { freq, power };
}

export const BANDS: [string, number, number][] = [
  ["Delta", 1, 4], ["Theta", 4, 8], ["Alpha", 8, 13], ["Beta", 13, 30],
  ["Low gamma", 30, 55], ["High gamma", 70, 150],
];

export function bandPower(freq: Float64Array, power: Float64Array) {
  return BANDS.map(([name, lo, hi]) => {
    let sum = 0;
    for (let i = 0; i < freq.length; i++) if (freq[i] >= lo && freq[i] < hi) sum += power[i];
    return { name, lo, hi, power: sum };
  });
}

/** Find repeating events by looking for a peak in the autocorrelation. */
export function rhythm(x: Float32Array | number[], fs: number) {
  const n = x.length;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += x[i];
  mean /= n;
  let denom = 0;
  for (let i = 0; i < n; i++) denom += (x[i] - mean) ** 2;
  if (denom < 1e-12) return { bpm: null as number | null, strength: 0, curve: [] as number[] };

  const maxLag = Math.min(n - 1, Math.round(fs * 4));   // down to 15 beats per minute
  const minLag = Math.max(2, Math.round(fs * 0.25));    // up to 240 beats per minute
  const curve: number[] = [];
  let best = -2;
  for (let lag = 1; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) s += (x[i] - mean) * (x[i + lag] - mean);
    const r = s / denom;
    curve.push(r);
    if (lag >= minLag && r > best) best = r;
  }
  if (best <= 0.08) return { bpm: null, strength: Math.max(0, best), curve };

  // A repeating signal correlates with itself at the period AND at every multiple
  // of it, and a later multiple can edge ahead by chance. Taking the plain maximum
  // therefore reports half or a third of the real rate. Walk up from the shortest
  // lag instead and take the first clear peak that gets close to the best score.
  const THRESH = 0.9 * best;
  const at = (lag: number) => curve[lag - 1] ?? -2;
  let bestLag = -1;
  for (let lag = minLag + 2; lag <= maxLag - 2; lag++) {
    const r = at(lag);
    if (r < THRESH) continue;
    // a genuine peak, not the shoulder of one, so check two samples either side
    if (r >= at(lag - 1) && r >= at(lag - 2) && r >= at(lag + 1) && r >= at(lag + 2)) {
      bestLag = lag;
      break;
    }
  }
  if (bestLag < 0) bestLag = curve.indexOf(best) + 1;

  // The true period rarely lands exactly on a sample. Fit a parabola through the
  // peak and its neighbours to recover the fraction in between.
  const y0 = at(bestLag - 1), y1 = at(bestLag), y2 = at(bestLag + 1);
  const denomP = y0 - 2 * y1 + y2;
  const shift = denomP !== 0 ? (0.5 * (y0 - y2)) / denomP : 0;
  const refined = bestLag + Math.max(-0.5, Math.min(0.5, shift));

  return { bpm: (60 * fs) / refined, strength: y1, curve };
}

/** Reads a comma or tab separated table. Returns numeric columns only. */
export function parseTable(text: string) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { headers: [] as string[], cols: [] as number[][] };
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const first = lines[0].split(sep).map((s) => s.trim());
  const headerRow = first.some((c) => c !== "" && isNaN(Number(c)));
  const headers = headerRow ? first : first.map((_, i) => `column ${i + 1}`);
  const body = headerRow ? lines.slice(1) : lines;

  const cols: number[][] = headers.map(() => []);
  for (const line of body) {
    const parts = line.split(sep);
    for (let i = 0; i < headers.length; i++) {
      const v = Number((parts[i] ?? "").trim());
      cols[i].push(Number.isFinite(v) ? v : NaN);
    }
  }
  const keep: number[] = [];
  cols.forEach((c, i) => {
    const good = c.filter((v) => Number.isFinite(v)).length;
    if (good > c.length * 0.6 && good > 8) keep.push(i);
  });
  return {
    headers: keep.map((i) => headers[i]),
    cols: keep.map((i) => cols[i].map((v) => (Number.isFinite(v) ? v : 0))),
  };
}

/** A column that only ever climbs is almost certainly a timestamp or row index,
 *  not the signal someone wants analysed. Pick the first column that is not one. */
export function pickSignalColumn(cols: number[][]): number {
  const climbsOnly = (c: number[]) => {
    let up = 0;
    for (let i = 1; i < c.length; i++) if (c[i] >= c[i - 1]) up++;
    return up / Math.max(1, c.length - 1) > 0.99;
  };
  for (let i = 0; i < cols.length; i++) if (!climbsOnly(cols[i])) return i;
  return 0;
}

export const fmt = (v: number, d = 3) =>
  v == null || !Number.isFinite(v) ? "—" : v.toFixed(d);
