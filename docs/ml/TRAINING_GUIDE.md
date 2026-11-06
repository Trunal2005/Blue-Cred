# Windows local training

Run these in PowerShell from the `team-nitrix` repository root. No system-wide installation, paid service, API key, GPU rental or billing activation is needed. The project-local CPU environment has already been created in this workspace.

```powershell
python -m venv ml/.venv
ml/.venv/Scripts/python -m pip install -r ml/requirements.txt
ml/.venv/Scripts/python -m unittest discover -s ml/tests -v
```

Exact resolved package versions for this session are recorded in `docs/ml-environment-lock.txt` (use with the CPU index in requirements for exact recreation). Windows sandboxing may block asyncio's internal loopback socket pair; run the same tests in a normal local PowerShell terminal. No external API is part of the tests.

## Prepare legitimate data

There is currently no suitable local paired dataset. Read DATASET_CARD.md first. Do not run a real experiment with the downloaded annotation-only tar. Obtain image/mask pairs, inspect licenses, labels, footprints, spectral scaling and geographic splits, then adapt `ml/manifest.example.json` into `ml/data/manifest.json`. Paths must resolve under the manifest directory. Supply real source/license/label definitions and geographic groups. The code never downloads datasets automatically and does not accept dataset instructions as executable code.

The default config expects Sentinel-2 TIFF reflectance, RGB bands 4/3/2 and scale 10,000. For a legitimately sourced RGB dataset, create a distinct config with `input_kind: "rgb"`, `bands: [1,2,3]`, `scale: 255` and an accurate `label`; use only true RGB PNG/JPEG imagery. Do not present that model as mangrove-specific unless the labels support it. Tiles are bounded to 4 million pixels; masks must align exactly. Mixed/nodata/ignore masks are rejected; documented preprocessing is required before use.

```powershell
# Run only after valid data is supplied and inspected.
ml/.venv/Scripts/python -m ml.train --manifest ml/data/manifest.json --config ml/config.json --output ml/artifacts/run1 --device cpu --epochs 20 --batch-size 2 --learning-rate 0.001 --seed 42
# Keep the same config and CLI overrides when resuming.
ml/.venv/Scripts/python -m ml.train --manifest ml/data/manifest.json --config ml/config.json --output ml/artifacts/run1 --resume ml/artifacts/run1/last.pt
# Evaluate the already selected best checkpoint; do not tune on the test set.
ml/.venv/Scripts/python -m ml.train --manifest ml/data/manifest.json --config ml/config.json --output ml/artifacts/run1 --resume ml/artifacts/run1/best.pt --evaluate-only
ml/.venv/Scripts/python -m ml.inference --checkpoint ml/artifacts/run1/best.pt --image ml/data/test/image03.tif --output ml/artifacts/prediction
```

Outputs: `best.pt`, `last.pt`, `history.json`, `config.json`, `test_metrics.json`; inference exports mask, overlay and result JSON. They are ignored by Git. Interrupted/time-limited runs retain previous completed checkpoints. Test results are computed after best selection. Use a separate experiment directory per dataset/config and preserve the final test set.

Local hardware: 16 CPU threads, 16.83 GB RAM with ~3.56 GB available at baseline, RTX 3050 4 GB. This session installs CPU PyTorch to keep the environment small; CUDA is unavailable in that wheel. No GPU performance claim is made. Start with a one-epoch smoke experiment on real training/validation tiles; reduce size/width if memory becomes tight. Existing system PostgreSQL PROJ settings conflicted with Rasterio; the ML package now selects Rasterio's bundled PROJ data only in its own process.
