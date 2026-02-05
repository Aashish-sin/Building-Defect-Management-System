"""rename csr_prognosis to initial_report

Revision ID: 7f2c1a9d4b1e
Revises: 3b87a4d8a7cd
Create Date: 2026-02-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '7f2c1a9d4b1e'
down_revision = '3b87a4d8a7cd'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        'defect_comments',
        'csr_prognosis',
        new_column_name='initial_report',
        existing_type=sa.Text(),
    )


def downgrade():
    op.alter_column(
        'defect_comments',
        'initial_report',
        new_column_name='csr_prognosis',
        existing_type=sa.Text(),
    )
