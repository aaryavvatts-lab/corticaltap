# NeuroTap

Interactive site for a study on reading finger movement from recordings made on the
surface of the brain. Eight patients, 735 electrodes, about 57 minutes of recording,
all from a public dataset.

Live: https://neurotap.vercel.app

## What is on it

Five tools, all running on real exported data, entirely in the browser:

- **Brain map** — 735 electrodes in 3D at their real coordinates. Click one to see its
  averaged high gamma response around a finger tap.
- **Signal lab** — play back a real recording. Seven frequency bands, tap markers, and
  the forecasting model's error underneath.
- **Live decoder** — the actual fitted logistic weights from the study, running in your
  browser. Pick a moment, get a movement prediction and a per electrode breakdown.
- **Check your own data** — three input modes. Load a CSV for a spectrum, band powers and
  a rhythm estimate. Read a series off a picture of a chart and download it as CSV. Or tap
  a rhythm and compare your steadiness with the patients.
- **Split test** — try the usual ways of splitting data into training and test sets and
  watch them fail on this recording.

Plus findings, methods, references, and proper privacy, terms, cookies and accessibility
pages.

## Results in short

The transformer forecasts brain activity 9.6% better than assuming nothing changes, and
all nine training runs beat that baseline. But:

| Claim | Outcome |
| --- | --- |
| Beats a plain linear decoder | No. 0.858 against 0.879, p = 0.38 |
| Pretraining transfers to a new patient | No. A random network did better in 8 of 8 patients, p = 0.008 |
| Learned space is better organised than raw signal | No. Silhouette 0.074 against 0.131 |
| Movement detectable with no labels | Yes, AUC 0.64, but error *falls* during movement rather than rising |

The analysis repo has the full write up and the code that produces every number.

## Running locally

```bash
npm install
npm run dev
```

Data files under `public/data` are exported from the analysis repo by
`scripts/09_export_web.py`. They are quantised to int8 where possible, so the whole set
is about 4 MB.

## Built with

Next.js, TypeScript, and Three.js for the 3D map. Charts are drawn by hand rather than
pulled from a chart library. No analytics, no tracking, no cookies.

## Data

OpenNeuro ds005931, released under CC0 by Riyo Ueda, Eishi Asano and colleagues at Wayne
State University. I did not collect it and am not connected to that team.

Not a medical device. Nothing here is medical advice.
