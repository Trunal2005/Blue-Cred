"""Bounded download of the documented public CC BY 4.0 reference archive only."""
import hashlib
from pathlib import Path
import urllib.request

from .prepare_gmw import EXPECTED_MD5


def main():
    destination = Path('ml/data/gmw2020/source.zip')
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        if hashlib.file_digest(destination.open('rb'), 'md5').hexdigest() != EXPECTED_MD5:
            raise ValueError('Existing archive differs; preserved without overwriting')
        print('Existing archive verified; no download performed')
        return
    partial = destination.with_suffix('.zip.part')
    url = 'https://zenodo.org/records/12756047/files/gmw_mng_2020_v4019_gtiff.zip?download=1'
    total, limit = 0, 185_000_000
    checksum = hashlib.md5()
    with partial.open('xb') as output, urllib.request.urlopen(url, timeout=45) as response:
        while True:
            chunk = response.read(min(1_048_576, limit-total+1))
            if not chunk:
                break
            total += len(chunk)
            if total > limit:
                raise ValueError('Download cap exceeded; partial retained for inspection')
            checksum.update(chunk); output.write(chunk)
    if total != 180_055_707 or checksum.hexdigest() != EXPECTED_MD5:
        raise ValueError('Publisher size/checksum mismatch; partial retained, not installed')
    partial.rename(destination)
    print(f'Public reference archive verified: {total} bytes')


if __name__ == '__main__':
    main()
