"""Local-only segmentation; isolate bundled PROJ from incompatible system installs."""
import importlib.util
import os
from pathlib import Path

spec = importlib.util.find_spec('rasterio')
if spec and spec.origin:
    bundled = Path(spec.origin).parent / 'proj_data'
    if (bundled / 'proj.db').is_file():
        # Process-local only. No Windows/system environment or PostgreSQL changes.
        os.environ['PROJ_DATA'] = str(bundled)
        os.environ['PROJ_LIB'] = str(bundled)
