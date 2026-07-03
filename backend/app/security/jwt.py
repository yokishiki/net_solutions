from typing import Annotated, Optional

from datetime import datetime, timedelta, timezone

import jwt

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

from app.models import User
from app.schemas.token import TokenData
import app.services.user as user_service
from app.core.exceptions import CredentialException
from app.db.session import SessionDep

SECRET_KEY = "404a75d61a9e3726d6dcd253936259f4ca48552cb49bc1c8aa45723ea274f63e"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

TokenDep = Annotated[str, Depends(oauth2_scheme)]


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expires_minutes = expires_delta
    else:
        expires_minutes = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_minutes
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(session: SessionDep, token: TokenDep) -> User | None:
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("username")
        if username is None:
            raise CredentialException()
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise CredentialException()
    user = user_service.get_user_from_token(session=session, params=token_data)
    if user is None:
        raise CredentialException()
    return user


CurrentUserDep = Annotated[Optional[str], Depends(get_current_user)]
