# Blue-Cred GMW2020 U-Net v1 — trained research prototype

**Real training and held-out evaluation completed. Model quality is insufficient for project verification or reliable mangrove-area estimation.** The trained CNN underperforms a fixed NDVI baseline on the test site.

## Architecture and provenance

Existing PyTorch U-Net reused: two encoder stages, bottleneck, bilinear decoder, skip connections, GroupNorm/ReLU, binary logits. Width 8, three RGB reflectance inputs, 128×128 grid, **30,081 parameters**. No pretrained weights, paid endpoint, synthetic scientific data or fabricated results.

Dataset: 144 real GMW 2020/WorldCover image-map pairs; 96 train (India/Myanmar), 24 validation (Thailand), 24 held-out test (Indonesia). Read DATASET_CARD.md for map-label, sample-selection, cloud and spatial limitations. Sensor B02/B03/B04/B08; CNN channels 3/2/1 / 10000; foreground is **GMW mapped mangrove reference extent**, not independently established mangrove presence.

Checkpoint: `ml/artifacts/run1/best.pt` — **exists locally**, 496,608 bytes including optimizer/provenance. SHA256 `774e78749f2bdd608076625138be1d4abd6046141b8a2e4e2be0b5267b86ff45`. The trained checkpoints, experiment records and prepared pairs are included in Git. `last.pt`, full history, config and final test metrics exist alongside it. Selected checkpoint was loaded in a fresh process and in the actual local FastAPI service.

## Training actually performed

A separate genuine-data smoke run completed 1 epoch with `--skip-test`; it did not evaluate the test split. Final experiment executed **7 epochs**, selecting **epoch 1** by minimum validation loss, then stopping after six unimproved epochs. Maximum configured 30 epochs / 20 minutes; actual recorded training-loop runtime **96.177 seconds** (excludes preparation/import/preflight). CPU, two threads, batch 4, seed 42; AdamW 0.001; BCE-with-logits + Dice; plateau scheduler, clipping norm 1; horizontal flips only for training. No test-driven retraining or threshold adjustment occurred.

Environment: Python 3.13.5, Torch 2.15.0+cpu, Windows, 16 logical CPU threads / ~16.83 GB total RAM, local RTX 3050 4 GB present but unused. Installed Torch is CPU-only; GPU training/inference latency is **not measured**. Exact free packages are in `docs/ml-environment-lock.txt`.

## Actual scores (foreground, global pixel counts)

| Metric | Best validation (24 Thailand tiles) | Held-out test (24 Indonesia tiles) |
| --- | --- | --- |
| IoU | 0.426927 | 0.291602 |
| Dice / F1 | 0.598387 | 0.451535 |
| Precision | 0.432370 | 0.296220 |
| Recall | 0.971358 | 0.949253 |
| Loss | 1.219472 | 1.462316 |
| Background IoU | 0.262063 | 0.254123 |
| Fixed NDVI >0.3 baseline IoU | 0.450987 | 0.320630 |

Test confusion: TP 92,369, FP 219,457, FN 4,938, TN 76,452. Threshold 0.5 for CNN probabilities and 0.3 for NDVI were fixed before evaluation. NDVI detects vegetation generally; it is not a mangrove classifier. The CNN's high recall/low precision and growing later validation loss show substantial false positives/overfitting. The best checkpoint is epoch 1, not the last model. Results from one sampled test site are not confidence-bounded regional performance estimates. No accuracy target is claimed achieved.

## CPU inference and actual integration

Standalone benchmark: one real 128px held-out TIFF, two CPU threads, five warmups / 30 repeats, local file cache. Median full pipeline **35.440 ms**, p95 **39.274 ms**; model-forward median **13.662 ms**. Checkpoint load excluding Python import **104.383 ms**. Full samples are in `docs/performance/phase2/model-validation.json`. These are local sequential latencies, not concurrent throughput. Browser/API cold-request latency is recorded separately in the browser E2E JSON.

Real browser test uploads an actual held-out TIFF through the existing `/submit` evidence step → Next `/api/analysis` → real FastAPI/PyTorch model → actual mask and overlay. Readiness is real, not mocked. Appwrite authentication/records and remote map tiles in that test are explicitly mocked, not external integration validation. The UI warns about low validation precision; it does not treat the output as certification. Public screenshot and four held-out RGB/reference/prediction diagnostics are under `docs/performance/phase2/`.

Raw reflectance is unchanged for inference. Preview alone uses gain 3 and gamma 1/2.2 to make dark satellite reflectance visible; the display stretch does not change masks or statistics. All acquired data use EPSG:4326, so actual demo area is null and pixel coverage is shown. Projected metre-grid area code is unit-tested, but field ground area remains unvalidated.

## Prohibited interpretations

Not appropriate for automatic project verification, reliable mapped area, species identification, change detection, carbon storage/sequestration estimation, carbon-credit certification or token minting. No uncertainty calibration or independent field validation. Human scientific review and broader independently labeled geographic data are required. Current model is a reproducible engineering baseline, not a production mangrove detector.
