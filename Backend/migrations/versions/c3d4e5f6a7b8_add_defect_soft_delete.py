"""Add defect soft delete metadata

Revision ID: c3d4e5f6a7b8
Revises: c2d3e4f5a6b7
Create Date: 2026-02-10 20:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b8'
down_revision = 'c2d3e4f5a6b7'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('defects', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    op.add_column('defects', sa.Column('deleted_by_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_defects_deleted_by_id_users',
        'defects',
        'users',
        ['deleted_by_id'],
        ['id'],
    )


def downgrade():
    op.drop_constraint('fk_defects_deleted_by_id_users', 'defects', type_='foreignkey')
    op.drop_column('defects', 'deleted_by_id')
    op.drop_column('defects', 'deleted_at')
