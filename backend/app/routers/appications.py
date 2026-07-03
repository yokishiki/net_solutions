from typing import Annotated

from fastapi import APIRouter, HTTPException, status, Query

from app.models import ApplicationCreate, ApplicationPublic, ApplicationUpdate
from app.schemas.application import GetApplicationsResponse, GetApplicationsParams, DeleteApplicationResponse
from app.db.session import SessionDep
from app.core.exceptions import ApplicationTitleWrongLengthException, ApplicationTitleEmptyException, \
    ApplicationIsDoneException, ApplicationDescTooLongException, ApplicationNotExistsException
from app.security.jwt import CurrentUserDep

import app.services.application as application_service

router = APIRouter(prefix="/applications")


@router.get("/", tags=["Заявки"], response_model=GetApplicationsResponse)
async def read_applications(params: Annotated[GetApplicationsParams, Query()], session: SessionDep):
    try:
        applications = application_service.get_applications(session=session, params=params)
        session.commit()
        return applications
    except Exception as e:
        print(e)
        session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)


@router.post("/", tags=["Заявки"], response_model=ApplicationPublic)
async def create_application(application: ApplicationCreate, session: SessionDep):
    try:
        new_application = application_service.create_application(session=session, params=application)
        session.commit()
        session.refresh(new_application)
        return new_application
    except (ApplicationTitleEmptyException, ApplicationTitleWrongLengthException, ApplicationDescTooLongException) as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)


@router.patch("/{application_id}", tags=["Заявки"], response_model=ApplicationPublic)
async def update_application(application_id: int, application: ApplicationUpdate, session: SessionDep):
    try:
        updated_application = application_service.update_application(session=session, application_id=application_id,
                                                                     params=application)
        session.commit()
        session.refresh(updated_application)
        return updated_application
    except (ApplicationTitleEmptyException, ApplicationTitleWrongLengthException, ApplicationDescTooLongException,
            ApplicationIsDoneException, ApplicationNotExistsException) as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)


@router.delete("/{application_id}", tags=["Заявки"])
async def delete_application(application_id: int, curr_user: CurrentUserDep, session: SessionDep):
    if not curr_user or not curr_user.is_admin:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недостаточно прав"
        )
    try:
        application_service.delete_application(session=session, application_id=application_id)
        session.commit()
        return DeleteApplicationResponse(ok=True)
    except ApplicationNotExistsException as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
