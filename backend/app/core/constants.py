from enum import StrEnum, IntEnum


class ApplicationStatusEnum(StrEnum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class ApplicationPriorityEnum(StrEnum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"


class ApplicationsSortBy(StrEnum):
    CREATE = "create"
    TITLE = "title"
    STATUS = "status"
    PRIORITY = "priority"


class SortDirection(IntEnum):
    DESC = -1
    ASC = 1


APPLICATION_PRIORITY_SORT_ORDER = {
    ApplicationPriorityEnum.LOW: 1,
    ApplicationPriorityEnum.NORMAL: 2,
    ApplicationPriorityEnum.HIGH: 3,
}

APPLICATION_STATUS_SORT_ORDER = {
    ApplicationStatusEnum.NEW: 1,
    ApplicationStatusEnum.IN_PROGRESS: 2,
    ApplicationStatusEnum.DONE: 3,
}
