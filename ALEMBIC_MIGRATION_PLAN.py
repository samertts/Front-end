"""
Phase A — DATA MODEL (SAFE ALEMBIC MIGRATIONS)
Mission: National Health Financial Engine for GULA
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    # 1. Providers Table (Nullable first, No FK)
    op.create_table(
        'providers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('plan', sa.String(50), nullable=True),
        sa.Column('quality_score', sa.Float(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('speed_score', sa.Float(), nullable=True),
        sa.Column('price_score', sa.Float(), nullable=True),
        sa.Column('reliability', sa.Float(), nullable=True)
    )
    
    # 2. Subscriptions
    op.create_table(
        'subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('provider_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('plan', sa.String(50), nullable=True),
        sa.Column('status', sa.String(50), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True)
    )

    # 3. Transactions
    op.create_table(
        'transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('provider_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('type', sa.String(50), nullable=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # 4. Ads Campaigns
    op.create_table(
        'ads_campaigns',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('provider_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('bid', sa.Float(), nullable=True),
        sa.Column('daily_limit', sa.Numeric(12, 2), nullable=True),
        sa.Column('spent_today', sa.Numeric(12, 2), nullable=True),
        sa.Column('active', sa.Boolean(), default=True)
    )

    # 5. Fraud Logs
    op.create_table(
        'fraud_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('provider_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # 6. Market Benchmarks
    op.create_table(
        'market_benchmarks',
        sa.Column('test_type', sa.String(100), primary_key=True),
        sa.Column('avg_price', sa.Float(), nullable=True),
        sa.Column('avg_time', sa.Float(), nullable=True)
    )

    # 7. Clinical Behavior
    op.create_table(
        'clinical_behavior',
        sa.Column('doctor_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('avg_tests_per_case', sa.Float(), nullable=True),
        sa.Column('deviation_score', sa.Float(), nullable=True)
    )

def downgrade():
    op.drop_table('clinical_behavior')
    op.drop_table('market_benchmarks')
    op.drop_table('fraud_logs')
    op.drop_table('ads_campaigns')
    op.drop_table('transactions')
    op.drop_table('subscriptions')
    op.drop_table('providers')
