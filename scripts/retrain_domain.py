import os
import sys
import json
import argparse
import subprocess

def retrain_domain(domain: str):
    scripts = {
        "steam": "scripts/train_steam_als.py",
        "bookcrossing": "scripts/train_bookcrossing_svd.py"
    }
    
    if domain not in scripts:
        print(f"Error: Unknown domain '{domain}'. Supported domains: {list(scripts.keys())}")
        sys.exit(1)
        
    script = scripts[domain]
    print(f"Starting retrain cycle for {domain}...")
    
    # We will pass --retrain flag to the script to tell it to auto-increment version
    result = subprocess.run([sys.executable, script, "--retrain"], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Retraining failed:\n{result.stderr}")
        sys.exit(result.returncode)
        
    print(result.stdout)
    print(f"Retraining for {domain} complete. Evaluating new model...")
    
    # Run evaluation
    eval_scripts = {
        "steam": "scripts/evaluate_steam.py",
        "bookcrossing": "scripts/evaluate_bookcrossing.py"
    }
    
    eval_script = eval_scripts.get(domain)
    if eval_script:
        result = subprocess.run([sys.executable, eval_script], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Evaluation failed:\n{result.stderr}")
            sys.exit(result.returncode)
        print(result.stdout)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Retrain a domain's model using latest interactions")
    parser.add_argument("domain", help="Domain to retrain (e.g. steam, bookcrossing)")
    args = parser.parse_args()
    
    retrain_domain(args.domain)
