# Steam Offline Evaluation Report

## Setup
- **Split**: Leave-one-out per user (randomized with fixed seed).
- **Test Set**: 1 randomly held-out item per eligible user.
- **Excluded Users**: 5700 users with only 1 interacted item were excluded from testing but kept in training.
- **Evaluation Users**: 6693
- **Metrics**: Precision@10, Recall@10

## Results (Baseline vs Hybrid)

| Model | Recall@10 | Precision@10 |
|---|---|---|
| Popularity Baseline | 0.2222 | 0.0222 |
| ALS (Implicit CF) | 0.4098 | 0.0410 |

