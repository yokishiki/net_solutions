from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.models import UserLogin, UserPublic
from app.db.session import SessionDep
from app.core.exceptions import UserNotExistsException
from app.security.jwt import create_access_token
from app.schemas.token import Token

import app.services.user as user_service

router = APIRouter(prefix="/auth")


@router.post("/login", tags=["Авторизация"])
async def login_user(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = user_service.login_user(session=session,
                                       params=UserLogin(username=form_data.username, password=form_data.password))
        session.commit()
        access_token = create_access_token(data={"username": user.username})
        return {
            "token": Token(access_token=access_token, token_type="bearer"),
            "user": UserPublic.from_orm(user)
        }
    except UserNotExistsException as e:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message,
                            headers={"WWW-Authenticate": "Bearer"})
    except Exception as e:
        session.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Внутренняя ошибка авторизации",
                            headers={"WWW-Authenticate": "Bearer"})
