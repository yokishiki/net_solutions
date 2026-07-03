import datetime as dt

from sqlmodel import Field, SQLModel
import sqlalchemy as sa
from sqlalchemy.orm import declared_attr


class UserBase(SQLModel):
    username: str = Field(min_length=1,
                          max_length=64,
                          unique=True,
                          nullable=False,
                          sa_type=sa.String(64),  # type: ignore
                          sa_column_args=(
                              sa.CheckConstraint("length(username) >= 1", name="user_username_min_length_check"),
                          ))
    is_admin: bool | None = Field(default=None)


class User(UserBase, SQLModel, table=True):
    @declared_attr
    def __tablename__(self):
        return "user"

    id: int | None = Field(default=None, primary_key=True)
    password: str = Field(nullable=False, sa_type=sa.String)
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow,
                                    sa_column_kwargs={
                                        "server_default": "CURRENT_TIMESTAMP"
                                    })
    updated_at: dt.datetime | None = Field(default=None,
                                           sa_column_kwargs={
                                               "onupdate": dt.datetime.utcnow
                                           })


class UserPublic(UserBase):
    id: int


class UserCreate(UserBase):
    pass


class UserLogin(UserBase):
    password: str
