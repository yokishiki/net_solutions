from sqlmodel import Session, select, or_, col, func, asc, desc, case

from app.models import Application, ApplicationCreate, ApplicationPublic, ApplicationUpdate
from app.schemas.application import GetApplicationsResponse, GetApplicationsParams
from app.core.constants import ApplicationsSortBy, APPLICATION_PRIORITY_SORT_ORDER, APPLICATION_STATUS_SORT_ORDER, \
    ApplicationStatusEnum
from app.core.exceptions import ApplicationIsDoneException, ApplicationTitleEmptyException, \
    ApplicationTitleWrongLengthException, \
    ApplicationDescTooLongException, ApplicationNotExistsException


def create_application(*, session: Session, params: ApplicationCreate) -> Application:
    title = params.title.strip()
    if title == "":
        raise ApplicationTitleEmptyException()
    if len(title) < 3 or len(title) > 120:
        raise ApplicationTitleWrongLengthException()

    db_application = Application(title=params.title,
                                 description=params.description,
                                 status=params.status,
                                 priority=params.priority)
    session.add(db_application)
    return db_application


def get_applications(*, session: Session, params: GetApplicationsParams) -> GetApplicationsResponse:
    size = params.size if params.size is not None else 20

    query = select(Application)
    if params.status is not None:
        query = query.where(Application.status == params.status)
    if params.priority is not None:
        query = query.where(Application.priority == params.priority)
    if params.search is not None:
        search_str = params.search.strip().lower()
        if search_str != "":
            search_patter = f"%{search_str}%"
            query = query.where(or_(col(Application.title).ilike(search_patter),
                                    col(Application.description).ilike(search_patter)))

    query_total = select(func.count()).select_from(query.subquery())

    order_bys = []
    match params.sort_by:
        case ApplicationsSortBy.CREATE.value | None:
            order_bys = [desc(Application.created_at) if params.sort_dir == -1 else asc(Application.created_at)]
        case ApplicationsSortBy.TITLE.value:
            order_bys = [desc(func.lower(Application.title)) if params.sort_dir == -1 else
                         asc(func.lower(Application.title)), asc(Application.created_at)]
        case ApplicationsSortBy.STATUS.value:
            order_expression = case(
                *[(Application.status == k, v) for k, v in APPLICATION_STATUS_SORT_ORDER.items()],
                else_=len(APPLICATION_STATUS_SORT_ORDER) + 1
            )
            order_bys = [desc(order_expression) if params.sort_dir == -1 else asc(order_expression),
                         asc(Application.created_at)]
        case ApplicationsSortBy.PRIORITY.value:
            order_expression = case(
                *[(Application.priority == k, v) for k, v in APPLICATION_PRIORITY_SORT_ORDER.items()],
                else_=len(APPLICATION_PRIORITY_SORT_ORDER) + 1
            )
            order_bys = [desc(order_expression) if params.sort_dir == -1 else asc(order_expression),
                         asc(Application.created_at)]

    query = query.order_by(*order_bys)

    if params.page is not None:
        query = query.offset((params.page - 1) * size)
    query = query.limit(size + 1)

    db_applications = session.exec(query).all()
    total_count: int = session.exec(query_total).one()

    session.commit()

    has_next = len(db_applications) > size
    applications: list[ApplicationPublic] = [ApplicationPublic.from_orm(application) for application in
                                             (db_applications[:size] if has_next else db_applications)]

    return GetApplicationsResponse(applications=applications,
                                   has_next=has_next,
                                   total_count=total_count,
                                   size=size,
                                   page=params.page if params.page is not None else 1)


def update_application(*, session: Session, application_id: int,
                       params: ApplicationUpdate) -> ApplicationPublic:
    db_application = session.exec(select(Application).where(Application.id == application_id)).first()

    if not db_application:
        raise ApplicationNotExistsException()

    if db_application.status == ApplicationStatusEnum.DONE.value:
        raise ApplicationIsDoneException()

    if params.title is not None:
        new_title = params.title.strip()
        if new_title == "":
            raise ApplicationTitleEmptyException()
        if len(new_title) < 3 or len(new_title) > 120:
            raise ApplicationTitleWrongLengthException()
        db_application.title = new_title

    if params.description is not None:
        new_description = params.description.strip()
        if len(new_description) > 1000:
            raise ApplicationDescTooLongException()
        db_application.description = new_description

    if params.status is not None:
        db_application.status = params.status

    if params.priority is not None:
        db_application.priority = params.priority

    session.add(db_application)
    return db_application


def delete_application(*, session: Session, application_id: int):
    db_application = session.exec(select(Application).where(Application.id == application_id)).first()
    if not db_application:
        raise ApplicationNotExistsException()

    session.delete(db_application)
    return
