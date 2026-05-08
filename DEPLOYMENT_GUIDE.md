# GULA Financial Engine Deployment Guide

## Phase I — Safe Deployment & Rollout

### 1. Docker Commands
Build the unified modular monolith container:
```bash
docker build -t gula-platform:latest .
docker run -p 3000:3000 --env-file .env gula-platform:latest
```

### 2. Step-by-Step Rollout
1. **Database Preparation**: Run Phase A migrations (`alembic upgrade head`).
2. **Backend Deployment**: Deploy the new Express/FastAPI routes with `ENABLE_FINANCIAL_ENGINE=false`.
3. **Feature Flag Activation**:
   - Enable `ENABLE_FINANCIAL_ENGINE` in a staging environment first.
   - Run a `simulate_market()` cycle to verify ranking stability.
   - Flip `ENABLE_ADS` once provider quality scores are normalized (min 1 week data).

### 3. Feature Flag Sequence
1. `MIGRATION_READY`: Tables exist, logic dormant.
2. `ENABLE_FINANCIAL_ENGINE`: Per-test charging active, rankings updated.
3. `ENABLE_ADS`: Bidding engine activated.

### 4. Rollback Instructions
If over-charging or ranking instability occurs:
1. `SET ENABLE_FINANCIAL_ENGINE=false`.
2. The platform reverts to the legacy non-financial provider views.
3. Database reflects state at `alembic downgrade -1`.

## Phase J — Simulation Insights
Run the simulation via:
`GET /api/financial/simulate`

Expected outputs evaluate:
- **Revenue Mix**: Subscription vs. Transaction vs. Ad Revenue.
- **Fraud Rate**: Percentage of clicks rejected by `FraudEngine`.
- **Ranking Fairness**: Concentration of top-tier results vs. anti-dominance caps.
