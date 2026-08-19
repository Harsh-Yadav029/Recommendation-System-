# Retailrocket Offline Evaluation Report

## Setup
- **Split**: Leave-one-out per user (randomized with fixed seed).
- **Test Set**: 1 randomly held-out item per eligible user.
- **Excluded Users**: 0 users with only 1 interacted item were excluded from testing but kept in training.
- **Evaluation Users**: 3431
- **Metrics**: Precision@10, Recall@10

## Results (Baseline vs Hybrid)

| Model | Recall@10 | Precision@10 |
|---|---|---|
| Popularity Baseline | 0.0131 | 0.0013 |
| ALS (Implicit CF) | 0.1259 | 0.0126 |

