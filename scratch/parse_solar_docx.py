import zipfile
import xml.etree.ElementTree as ET
import csv
import pandas as pd

docx_path = 'fire detection dataset/delhi_simulated_solar_data_june_aug_2021.docx'
csv_path = 'backend/data/delhi_solar_data.csv'

print(f"Reading {docx_path}...")
z = zipfile.ZipFile(docx_path)
tree = ET.fromstring(z.read('word/document.xml'))
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

rows = tree.findall('.//w:tr', ns)
parsed_rows = []
for row in rows:
    cells = [''.join(tc.itertext()).strip() for tc in row.findall('.//w:tc', ns)]
    if cells:
        parsed_rows.append(cells)

print(f"Total rows extracted: {len(parsed_rows)}")
print("Header:", parsed_rows[0] if parsed_rows else [])
print("Row 1:", parsed_rows[1] if len(parsed_rows) > 1 else [])

with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(parsed_rows)

print(f"Saved to {csv_path}")

# Validate using Pandas
df = pd.read_csv(csv_path)
print(df.info())
print(df.head())
