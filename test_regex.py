import re
import glob

def parse_report(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    baseline_match = re.search(r'\|\s*Popularity Baseline.*?\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|', content)
    hybrid_match = re.search(r'\|\s*(?:ALS|SVD).*?\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|', content)
    
    return {
        "baseline": {
            "recall": float(baseline_match.group(1)) if baseline_match else None,
            "precision": float(baseline_match.group(2)) if baseline_match else None
        },
        "hybrid": {
            "recall": float(hybrid_match.group(1)) if hybrid_match else None,
            "precision": float(hybrid_match.group(2)) if hybrid_match else None
        }
    }

for file in glob.glob('docs/model_reports/*_evaluation.md'):
    print(f"--- {file} ---")
    print(parse_report(file))
