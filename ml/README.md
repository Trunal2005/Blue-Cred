# Local coastal vegetation segmentation

Status: **real GMW/WorldCover 2020 training and website inference verified**. The small site-disjoint CNN has low precision and underperforms fixed NDVI on the held-out site; it is an engineering research prototype, not a reliable mangrove-area or certification system.

Actual checkpoint: `ml/artifacts/run1/best.pt` (local, ignored by Git). Actual experiment config: `ml/gmw-config.json`; `ml/config.json` is the earlier generic MANGO-oriented template and is not the trained configuration. The real experiment completed 7 epochs and selected epoch 1. Synthetic unit tests remain separate and their temporary weights are removed.

Read the [dataset card](../docs/ml/DATASET_CARD.md), [model card](../docs/ml/MODEL_CARD.md), [training guide](../docs/ml/TRAINING_GUIDE.md), [integration guide](../docs/ml/INTEGRATION_GUIDE.md) and [final validation](../docs/BLUECRED_FINAL_VALIDATION.md). Start local services with `scripts/start-local-ml.ps1`; ordinary frontend works without ML. No paid services, cloud compute, automatic project writes or blockchain minting.
