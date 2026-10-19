"""Validate Shopify template values against section schemas before packaging."""
import json
import re
import sys
from decimal import Decimal
from pathlib import PurePosixPath
from zipfile import ZipFile

errors = []
with ZipFile(sys.argv[1]) as archive:
    names = set(archive.namelist())
    assert archive.testzip() is None, 'ZIP integrity failure'
    assert 'layout/theme.liquid' in names and 'templates/index.json' in names
    assert all(PurePosixPath(n).parts[0] in {'assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'} for n in names)
    schemas = {}
    for name in names:
        if name.startswith('sections/') and name.endswith('.liquid'):
            match = re.search(r'{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}', archive.read(name).decode())
            if match:
                schemas[PurePosixPath(name).stem] = json.loads(match[1])

    def settings(values, specs, context):
        lookup = {spec['id']: spec for spec in specs if 'id' in spec}
        for key, value in values.items():
            spec = lookup.get(key)
            if not spec:
                errors.append(f'{context}: unknown setting {key}')
                continue
            if spec['type'] == 'range':
                number = Decimal(str(value))
                minimum, maximum = Decimal(str(spec['min'])), Decimal(str(spec['max']))
                step = Decimal(str(spec.get('step', 1)))
                if not minimum <= number <= maximum or (number - minimum) % step:
                    errors.append(f'{context}: {key}={value} outside allowed {minimum}–{maximum}, step {step}')
            if spec['type'] in {'product_list', 'collection_list'} and len(value) > spec.get('limit', 50):
                errors.append(f'{context}: too many values for {key}')
            if key == 'asset' and value and 'assets/' + value not in names:
                errors.append(f'{context}: missing photo asset {value}')

    for name in sorted(names):
        if not (name.endswith('.json') and name.startswith(('templates/', 'sections/'))):
            continue
        definition = json.loads(archive.read(name))
        sections = definition.get('sections', {})
        for section_id in definition.get('order', []):
            if section_id not in sections:
                errors.append(f'{name}: missing ordered section {section_id}')
        for section_id, section in sections.items():
            kind = section['type']
            if kind not in schemas:
                errors.append(f'{name}: missing section schema {kind}')
                continue
            schema = schemas[kind]
            context = f'{name}/{section_id}'
            settings(section.get('settings', {}), schema.get('settings', []), context)
            block_specs = {block['type']: block for block in schema.get('blocks', [])}
            for block_id, block in section.get('blocks', {}).items():
                spec = block_specs.get(block['type'])
                if not spec:
                    errors.append(f'{context}: unknown block type {block["type"]}')
                else:
                    settings(block.get('settings', {}), spec.get('settings', []), context + '/' + block_id)

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('Passed: ZIP integrity, template/section settings, range bounds and steps, block types, and selected photo assets.')
