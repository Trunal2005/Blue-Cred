# Dataset card — GMW/WorldCover 2020 local reference pairs

Current status: **144 genuine paired satellite-image/reference-mask tiles acquired and validated**. No synthetic imagery or fabricated labels were used in the scientific experiment.

## Sources, rights and attribution

Labels: [Global Mangrove Watch annual extent, v4.0.19, reference year 2020](https://doi.org/10.5281/zenodo.12756047), Bunting, Hilarides, Rosenqvist, Zanaga, Van De Kerchove, Lucas and Castro Brandao Vaz dos Santos (2024). CC BY 4.0 verified from Zenodo metadata. Archive `gmw_mng_2020_v4019_gtiff.zip`: 180,055,707 bytes; published and independently checked MD5 `a94b1600d891cda0e1ea0f17b312990b`.

Imagery: [ESA WorldCover Sentinel-2 L2A annual median composites](https://esa-worldcover.org/en/data-access), year 2020, v100. [Official open-data registry](https://registry.opendata.aws/esa-worldcover-vito-composites/) documents CC BY 4.0, anonymous account-free access and RequesterPays=false. Only unsigned HTTPS static-file range reads were used. No AWS account, credentials, compute, storage resource, Data Exchange subscription or billing activation was created. The hosting location is not a paid computing service used by this project.

Attribution: © ESA WorldCover project 2020 / Contains modified Copernicus Sentinel data (2020), processed by ESA WorldCover consortium. Credit Global Mangrove Watch creators and ESA/VITO/Copernicus for derived patches, masks, overlays, model and published figures. Primary licensing references: [WorldCover terms](https://esa-worldcover.org/en/data-access), [Copernicus Sentinel legal notice](https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice). The preparation/resampling and display stretch are modifications; neither provider endorses the model.

## Input and label definitions

2020 annual median composites, not individual date-matched scenes. Per-pixel acquisition dates are unavailable. Source TIFF has four bands in **B02 blue, B03 green, B04 red, B08 NIR** order, uint16 reflectance. CNN reads RGB indices **3/2/1**, divided by 10,000. NIR/red indices 4/3 are retained for the fixed NDVI evaluation baseline. Do not use the prior MANGO 4/3/2 band mapping for this product.

Both products are geographic EPSG:4326. Actual GMW grid is 0.0001 degrees (10,000×10,000 cells per degree); imagery grid is 1/12,000 degrees. Both are marketed as nominal ~10 m products, but degree spacing is not a constant metre-area grid. GMW filenames identify the **northwest** corner; imagery names identify the **southwest** corner. Preparation verifies identical geographic bounds and nearest-neighbor reprojects labels onto each exact image window affine/CRS. Written 128×128 image/mask pairs share transform, dimensions and CRS. No degrees are converted into guessed square metres/hectares.

Foreground 1 means mapped GMW mangrove; 0 means not mapped as mangrove. **These are map-derived references, not independent field-verified ground truth or proof of absence.** The GMW product itself used 2020 Sentinel-2/WorldCover processing, so shared sensor and mapping biases are expected. PNG/hand-labeled stand-ins were not substituted.

## Splits and selection

| Site / source imagery tile | Split | Pairs |
| --- | --- | --- |
| Sundarbans, India / N21E088 | train | 48 |
| Ayeyarwady, Myanmar / N15E095 | train | 48 |
| Phang Nga region, Thailand / N08E098 | validation | 24 |
| Sumatra region, Indonesia / N00E103 | final test | 24 |

Entire sites are assigned before training. Countries/source footprints are geographically disjoint; nonoverlapping 128px windows are snapped to a fixed grid. No tile from a site appears across splits. Seed 42; candidate windows sampled around mapped coastal extents and neighboring windows. Each site has 75% windows with ≥5% mapped foreground and 25% with <5%. This intentionally sampled distribution does not represent regional prevalence. Small/dispersed mangroves can be missed by the coarse candidate overview. Two training sites and one test site are insufficient to establish global generalization.

145 source-image window read attempts yielded 144 valid pairs; one Thailand candidate failed nodata/range screening. Product value zero is image nodata: any such pixel in any of the four bands rejects the patch. Nonfinite/invalid range, duplicates, mismatched shape/CRS/transform and corrupt inputs are rejected by preflight. The provider's annual-composite processing handles scene selection; per-pixel SCL/cloud-quality layers are not present in this subset, so residual clouds/haze and compositing artifacts remain unquantified. Reference background zero is retained as a class, not silently removed as ignore/nodata.

Source URLs, bounds, grid offsets, exact split assignments and foreground fractions are in ignored `ml/data/gmw2020/pairs/manifest.json`; public preparation summary and hashes are under `docs/performance/phase2/`. All train/validation pairs were decoded before training. The smoke run explicitly skipped held-out evaluation. Test images were acquired/validated for integrity during preparation, but no test metric was used for training, model selection or threshold tuning. Final test evaluation ran only after validation-loss selection; no subsequent model fitting was performed.

## Investigated alternatives (not used for training)

- MANGO remains access-gated; earlier HTTP 401 failures were not repeated or bypassed and no terms were accepted automatically.
- The prior 62.4 MB Allen AI archive contains annotations/time-series task metadata without paired imagery. Not used for this segmentation experiment.
- Suggested [nikolkoo/SatelliteSegmentation](https://huggingface.co/datasets/nikolkoo/SatelliteSegmentation): public CC BY 4.0; 790 256px RGB/ESA-WorldCover mask pairs for Norway. A bounded 93,617,398-byte Parquet download was inspected (SHA256 `e0a9daaabce24a9fa256d21aa7c2991897e3efd964b56a3063bb769f315f8176`), then left unused because mangrove-specific pairs became feasible. It is not mangrove training data.

All data/weights remain local and ignored by Git. The trained CNN's poor held-out precision is reported in MODEL_CARD.md; it must not support automatic certification or area verification.
