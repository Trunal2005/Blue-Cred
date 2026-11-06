# Dataset access and suitability — 6 November 2026

## Selected target: MANGO (not acquired)

Primary sources: [publisher repository](https://github.com/ROKMC1250/MANGO), [dataset card](https://huggingface.co/datasets/hjh1037/MANGO), [paper](https://arxiv.org/abs/2601.17039).

Publisher describes 42,703 binary mangrove image-mask pairs, Sentinel-2 imagery from 2020, 256×256 GeoTIFFs, 13 channels, 124 countries and country-disjoint train/validation/test splits. Dataset card metadata advertises MIT; verify underlying label attribution and downloaded license before an experiment. The nominal channels include B1/B2/B3/B4/B5/B6/B7/B8/B8A/B9/B11/B12 and SCL, with native 10/20/60 m bands; actual output transform must determine grid spacing. The default pipeline uses B4/B3/B2 divided by 10,000, not SCL as reflectance. Sensor scaling, processing baseline offsets, mask encoding and resampling must be verified on acquired files, not assumed.

File listing was publicly readable. `data.tar` is 32,121,978,880 bytes. Two bounded download attempts returned **HTTP 401 Unauthorized**, including a fresh URL. No access controls bypassed, no terms accepted, no full archive downloaded. No local paired rasters exist. No masks, cloud/nodata distributions or spatial splits have been verified. Training cannot start from metadata alone.

## Evaluated alternative: Allen AI OlmoEarth mangrove annotations (acquired, unsuitable)

Primary sources: [dataset](https://huggingface.co/datasets/allenai/olmoearth_projects_mangrove), [publisher documentation](https://github.com/allenai/olmoearth_projects/blob/main/docs/mangrove.md), [Global Mangrove Watch source](https://zenodo.org/records/17394267).

CC BY 4.0, attribution: Allen Institute for AI and Global Mangrove Watch reference-sample creators. The publisher adapts GMW reference points to 12 monthly Sentinel-2 L2A observations, classifying mangrove, water and other in 2×2 patches. This is **not a paired dense segmentation dataset** in the downloaded archive.

Downloaded `ml/data/mangrove.tar`, 62,433,280 bytes, SHA256 `ef9dba6a18ec03217e233abf9652423612d8f42999d69637920aa31d1e2d3594`. Read-only tar inspection found 2,000 GeoJSONs, 2,001 JSON metadata files, one CSV and 2,000 completion markers: **zero image or raster-mask files**. It was not extracted or executed. The publisher's patch-hash train/validation split has no independent test partition in this archive. No model was trained on it. See `../performance/dataset-inspection.json`.

## Required preparation before real training

Obtain legitimately licensed paired imagery without billing. Keep original country/site splits; supply explicit geographic `group` values in a manifest under `ml/data/`. Do not randomly split neighboring tiles. Check footprints and provenance manually: group names and content hashes cannot detect all spatial overlap. All train/validation pairs are decoded before training; dimensions, channels, masks, georeferencing, numeric ranges and duplicate hashes are checked. Test imagery is decoded only after best-validation selection, although file hashes are read during manifest validation. No nodata or ignore-label support is silently invented; unsupported tiles must be excluded/documented. Only 0/1 or 0/255 binary masks are accepted. The manifest example is a template, not data or permission to use data.

Current real train / validation / test sample counts: **0 / 0 / 0**. Geographic generalization, mangrove accuracy, class balance and physical-area accuracy remain unmeasured. Do not substitute generic forest labels or synthetic test fixtures and call them mangrove ground truth.
