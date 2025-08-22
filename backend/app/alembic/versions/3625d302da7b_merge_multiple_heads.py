"""Merge multiple heads

Revision ID: 3625d302da7b
Revises: 20231115_0001, 217a567849c1
Create Date: 2025-08-16 06:59:39.526965

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '3625d302da7b'
down_revision = ('20231115_0001', '217a567849c1')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
