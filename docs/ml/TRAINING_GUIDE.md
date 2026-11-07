# Reproduce local GMW2020 training (Windows PowerShell)

Run from `C:/projects/Carbon credit transfer system/bluecred/team-nitrix`. All tools/data are free; no GPU rental, account, API key or cloud compute. The trained checkpoint, experiment records and 144 prepared image-mask pairs are included in the repository. The original large source archives and virtual environment remain local.

## Environment and genuine source data

```powershell
# Create only if missing; preserve the existing local environment.
if (!(Test-Path ml/.venv/Scripts/python.exe)) { python -m venv ml/.venv }
ml/.venv/Scripts/python -m pip install -r docs/ml-environment-lock.txt --extra-index-url https://download.pytorch.org/whl/cpu
# Verify the existing GMW archive, or download this one public CC BY 4.0 file with a 185 MB cap.
ml/.venv/Scripts/python -m ml.download_gmw
# Only when regenerating data into a fresh output directory. The included pairs directory is protected.
ml/.venv/Scripts/python -m ml.prepare_gmw --archive ml/data/gmw2020/source.zip --output ml/data/gmw2020/pairs
```

The archive checksum must match the publisher. Preparation reads small anonymous WorldCover COG windows for four fixed sites, not whole satellite tiles. No AWS SDK/account/billing is used; the official bucket is non-Requester-Pays and documented free. The exact URLs, permissions, attribution, year, masks and sampling caveats are in DATASET_CARD.md. Never bypass gated MANGO access or accept terms automatically. The Norway Parquet fallback was inspected, not used in this model.

Preparation verifies footprint bounds despite opposite tile-name conventions, reprojects GMW masks to the imagery affine grid, excludes nodata and saves genuine aligned 128px four-band TIFFs plus masks. `manifest.json` records provenance, exact windows and site splits. The training loader checks hashes, duplicate content, shape/channel/range/CRS/affine alignment and split groups. Human provenance/footprint review still matters; group strings do not themselves prove geographic independence for arbitrary supplied datasets.

## Commands actually executed

```powershell
# Genuine smoke training; held-out evaluation deliberately skipped.
ml/.venv/Scripts/python -m ml.train --manifest ml/data/gmw2020/pairs/manifest.json --config ml/gmw-config.json --output ml/artifacts/gmw-smoke --epochs 1 --skip-test
# Final frozen experiment: 7 epochs executed / best validation epoch 1 / early stopping.
ml/.venv/Scripts/python -m ml.train --manifest ml/data/gmw2020/pairs/manifest.json --config ml/gmw-config.json --output ml/artifacts/run1
# Fresh-process checkpoint/inference verification and CPU benchmark.
ml/.venv/Scripts/python -m ml.validate_model
```

**Do not rerun these output paths to overwrite evidence.** The CLI refuses an output containing weights unless resume is explicitly requested. To reproduce a new run, use a fresh directory such as `ml/artifacts/run2`. Configuration: seed 42, width 8, 128px input, RGB bands 3/2/1 divided by 10000, two CPU threads, batch 4, AdamW 0.001, BCE+Dice, gradient clipping 1, plateau scheduler, patience 6, maximum 30 epochs and 20 minutes per invocation. No scientific accuracy target was imposed. The current model's poor test precision is an actual result, not a reason to fabricate better scores.

For an interrupted **new** experiment (same manifest/config and same output directory):

```powershell
ml/.venv/Scripts/python -m ml.train --manifest ml/data/gmw2020/pairs/manifest.json --config ml/gmw-config.json --output ml/artifacts/run2 --resume ml/artifacts/run2/last.pt
ml/.venv/Scripts/python -m ml.train --manifest ml/data/gmw2020/pairs/manifest.json --config ml/gmw-config.json --output ml/artifacts/run2 --resume ml/artifacts/run2/best.pt --evaluate-only
# Example actual held-out TIFF; directory/filename comes from the frozen manifest.
ml/.venv/Scripts/python -m ml.inference --checkpoint ml/artifacts/run1/best.pt --image ml/data/gmw2020/pairs/images/indonesia-sumatra-11776-6784.tif --output ml/artifacts/example-prediction
ml/.venv/Scripts/python -m unittest discover -s ml/tests -v
```

Outputs: best.pt, last.pt, history.json, config.json, test_metrics.json; inference exports actual PNG mask/overlay and JSON statistics. Resume restores optimizer, scheduler and CPU RNG; changed config/manifest/content is rejected. Exact CUDA resume reproducibility is not established. Final test is for evaluation only; do not tune the frozen experiment on its published test metrics. A scientifically improved future model needs broader labeled training and a fresh independent holdout.

Hardware: 16 CPU threads, 16.83 GB RAM total, ~3.38 GB available at Phase 2 inspection, RTX 3050 4 GB present. The existing CPU PyTorch wheel sufficed; no CUDA install or GPU charge. Two-thread bounded training completed in about 96 seconds of recorded training-loop time. Rasterio uses its bundled PROJ data within the ML process to avoid the system PostgreSQL conflict; no system configuration was changed. Windows sandbox restrictions can block asyncio loopback sockets: normal local PowerShell supports the actual HTTP tests.
