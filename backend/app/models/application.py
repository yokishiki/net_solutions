import datetime as dt

from sqlmodel import Field, SQLModel
import sqlalchemy as sa
from sqlalchemy.orm import declared_attr

from app.core.constants import ApplicationPriorityEnum, ApplicationStatusEnum


class ApplicationBase(SQLModel):
    title: str = Field(min_length=3,
                       max_length=120,
                       nullable=False,
                       sa_type=sa.String(120),  # type: ignore
                       sa_column_args=(
                           sa.CheckConstraint("length(title) >= 3", name="application_title_min_length_check"),
                       ))
    description: str | None = Field(default=None, max_length=1000)
    status: ApplicationStatusEnum = Field(default=ApplicationStatusEnum.NEW.value,
                                          sa_type=sa.String,
                                          nullable=False,
                                          sa_column_args=(
                                              sa.CheckConstraint(f"status IN('{ApplicationStatusEnum.NEW.value}', "
                                                                 f"'{ApplicationStatusEnum.IN_PROGRESS.value}', "
                                                                 f"'{ApplicationStatusEnum.DONE.value}')",
                                                                 name="application_status_check"),
                                          ))
    priority: ApplicationPriorityEnum = Field(default=ApplicationPriorityEnum.NORMAL.value,
                                              sa_type=sa.String,
                                              nullable=False,
                                              sa_column_args=(
                                                  sa.CheckConstraint(
                                                      f"priority IN('{ApplicationPriorityEnum.LOW.value}', "
                                                      f"'{ApplicationPriorityEnum.NORMAL.value}', "
                                                      f"'{ApplicationPriorityEnum.HIGH.value}')",
                                                      name="application_priority_check"),
                                              ))


class Application(ApplicationBase, SQLModel, table=True):
    @declared_attr
    def __tablename__(self):
        return "application"

    id: int | None = Field(default=None, primary_key=True)
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow,
                                    sa_column_kwargs={
                                        "server_default": "CURRENT_TIMESTAMP"
                                    })
    updated_at: dt.datetime | None = Field(default=None,
                                           sa_column_kwargs={
                                               "onupdate": dt.datetime.utcnow
                                           })


class ApplicationPublic(ApplicationBase):
    id: int
    created_at: dt.datetime

    model_config = {"from_attributes": True}


class ApplicationCreate(ApplicationBase):
    status: ApplicationStatusEnum | None = Field(default=None)
    priority: ApplicationPriorityEnum | None = Field(default=None)


class ApplicationUpdate(ApplicationBase):
    title: str | None = Field(default=None)
    status: ApplicationStatusEnum | None = Field(default=None)
    priority: ApplicationPriorityEnum | None = Field(default=None)
