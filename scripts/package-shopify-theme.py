"""Package the editable Shopify theme, excluding previews and nested ZIP files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
source = root / 'shopify-theme'
output = root / 'artifacts' / 'Dimohe-Shopify-October18-Refined.zip'
folders = {'assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'}
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED, compresslevel=9) as archive:
    for folder in sorted(folders):
        for file in sorted((source / folder).rglob('*')):
            if file.is_file() and not file.name.startswith('.'):
                archive.write(file, file.relative_to(source).as_posix())
assert output.stat().st_size < 50_000_000, 'Theme exceeds the requested 50 MB limit'
subprocess.run([sys.executable, str(root / 'scripts/validate-shopify-package.py'), str(output)], check=True)
print(f'{output}: {output.stat().st_size / 1_000_000:.2f} MB')
