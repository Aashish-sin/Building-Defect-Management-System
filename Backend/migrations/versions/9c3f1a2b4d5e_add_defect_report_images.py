"""add defect report images

Revision ID: 9c3f1a2b4d5e
Revises: 7f2c1a9d4b1e
Create Date: 2026-02-04 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9c3f1a2b4d5e'
down_revision = '7f2c1a9d4b1e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('defects', sa.Column('initial_report_image', sa.Text(), nullable=True))
    op.add_column('defects', sa.Column('technician_report_image', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('defects', 'technician_report_image')
    op.drop_column('defects', 'initial_report_image')
