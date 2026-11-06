# Blue-Cred U-Net v1 — untrained pipeline

**No genuine mangrove checkpoint exists. Not scientifically validated or production ready.**

Architecture: PyTorch encoder-decoder CNN, two encoder stages, bottleneck, bilinear decoder and skip connections; GroupNorm/ReLU; binary logit head. Default 3 RGB reflectance channels, base width 8, 30,081 parameters and 128×128 model grid. Uses fixed preprocessing shared by training/inference. Image resizing loses fine spatial detail and is a limitation, not a validated tiling strategy.

Training configuration: `ml/config.json`; CPU, two threads, batch 2, AdamW 0.001, BCE-with-logits plus Dice loss, ReduceLROnPlateau, clipping norm 1, seed 42, horizontal-flip augmentation only for training, validation-loss best-checkpoint selection, patience 5, maximum 20 epochs / 20 minutes per invocation. Default trainable weights are about 120 KB float32 before metadata/optimizer; no real checkpoint size is reported. Resume restores optimizer, scheduler and CPU Torch RNG and rejects changed manifest/config/content. CUDA CLI exists but the installed wheel is CPU-only; GPU path and exact CUDA-resume reproducibility are unverified.

Real epochs completed: **0**. Best epoch, validation IoU/Dice/precision/recall/F1/loss, held-out test metrics, real inference latency and model checkpoint size: **not available**. Expected future checkpoint: `ml/artifacts/run1/best.pt`; **does not currently exist**. No random weights are exposed as trained predictions.

The nine software tests include a two-epoch run on tiny synthetic fixtures, checkpoint loading, resume and fresh-process prediction. These fixtures and artifacts are temporary and removed; their scores are not scientific results. No synthetic checkpoint is delivered or installed in the service.

Evaluation code aggregates foreground confusion counts, IoU, Dice/F1, precision, recall, background IoU, loss, loading-inclusive seconds/image and a fixed RGB excess-green baseline. Undefined zero-denominator metrics are null. The baseline is not NDVI or a validated mangrove discriminator. Test evaluation does not tune thresholds. Checkpoints record source, license, file hashes, package version, config, selected epoch and actual session runtime. Repeated resume commands can extend the per-invocation time budget; keep experiments bounded deliberately.

Inference loads a locally trusted, provenance-bearing checkpoint once, runs evaluation with `torch.inference_mode`, and returns a preview mask/overlay, original-grid pixel coverage and model version. Hectares are omitted unless projected metre CRS/affine pixel area is available; determinant handles rotated grids. Grid area is not necessarily geodesic ground area (projection distortion remains). No uncertainty calibration, cross-region validation, cloud model, species verification or carbon estimation is available.

**Not appropriate for automated project verification, carbon-credit certification, carbon sequestration estimation or token minting.** Human review and independent scientific validation are required before any such downstream use.
