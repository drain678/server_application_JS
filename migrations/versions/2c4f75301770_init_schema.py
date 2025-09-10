from alembic import op
import sqlalchemy as sa

revision = 'init_schema_orders'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(100), nullable=False, unique=True),
        sa.Column('phone', sa.String(20)),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now())
    )

    op.create_table(
        'orders',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey(
            'users.id', ondelete="CASCADE"), nullable=False),
        sa.Column('order_date', sa.TIMESTAMP, server_default=sa.func.now()),
        sa.Column('status', sa.String(20), server_default='new'),
        sa.Column('total_amount', sa.Numeric(10, 2),
                  nullable=False, server_default="0.00")
    )

    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('order_id', sa.Integer, sa.ForeignKey(
            'orders.id', ondelete="CASCADE"), nullable=False),
        sa.Column('product_name', sa.String(200), nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False, server_default="1"),
        sa.Column('price', sa.Numeric(10, 2),
                  nullable=False, server_default="0.00")
    )


def downgrade():
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('users')
