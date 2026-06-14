"""Idempotent Alembic helpers when baseline 001 used create_all."""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


def table_exists(name: str) -> bool:
    return sa.inspect(op.get_bind()).has_table(name)


def index_exists(table_name: str, index_name: str) -> bool:
    if not table_exists(table_name):
        return False
    indexes = sa.inspect(op.get_bind()).get_indexes(table_name)
    return any(index["name"] == index_name for index in indexes)


def create_table_if_absent(*args, **kwargs) -> None:
    name = args[0]
    if not table_exists(name):
        op.create_table(*args, **kwargs)


def create_index_if_absent(index_name: str, table_name: str, columns, **kwargs) -> None:
    if not index_exists(table_name, index_name):
        op.create_index(index_name, table_name, columns, **kwargs)


def column_exists(table_name: str, column_name: str) -> bool:
    if not table_exists(table_name):
        return False
    columns = sa.inspect(op.get_bind()).get_columns(table_name)
    return any(column["name"] == column_name for column in columns)


def add_column_if_absent(table_name: str, column: sa.Column, **kwargs) -> None:
    if not column_exists(table_name, column.name):
        op.add_column(table_name, column, **kwargs)
