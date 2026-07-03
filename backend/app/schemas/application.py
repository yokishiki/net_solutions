from typing import List, Optional

from pydantic import BaseModel

from app.core.constants import ApplicationStatusEnum, ApplicationPriorityEnum, ApplicationsSortBy, SortDirection
from app.models import Application


class GetApplicationsResponse(BaseModel):
    applications: List[Application]
    total_count: int
    size: int
    page: int
    has_next: bool


class GetApplicationsParams(BaseModel):
    size: Optional[int] = None
    page: Optional[int] = None
    status: Optional[ApplicationStatusEnum] = None
    priority: Optional[ApplicationPriorityEnum] = None
    search: Optional[str] = None
    sort_by: Optional[ApplicationsSortBy] = None
    sort_dir: Optional[SortDirection] = None


class DeleteApplicationResponse(BaseModel):
    ok: bool
