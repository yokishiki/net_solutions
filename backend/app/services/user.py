from sqlmodel import Session, select, col

from app.models import User, UserCreate, UserLogin
from app.core.exceptions import UserUsernameEmptyException, UserUsernameLengthException, UserUsernameExistsException, \
    UserNotExistsException
from app.security.password import get_password_hash, verify_password
from app.schemas.token import TokenData


def create_user(*, session: Session, params: UserCreate) -> User:
    username = params.username.strip().lower()
    if username == "":
        raise UserUsernameEmptyException()
    if len(username) > 64:
        raise UserUsernameLengthException()

    db_user_exists = session.exec(select(User).where(col(User.username).ilike(username))).first()
    if db_user_exists is not None:
        raise UserUsernameExistsException()

    db_user = User(username=username, is_admin=params.is_admin, password=get_password_hash(params.password))
    session.add(db_user)
    return db_user


def login_user(*, session: Session, params: UserLogin) -> User:
    db_user = session.exec(select(User).where(col(User.username).ilike(params.username.lower()))).first()
    if db_user is None:
        raise UserNotExistsException()

    if not verify_password(params.password, db_user.password):
        raise UserNotExistsException()

    return db_user


def get_user_from_token(*, session: Session, params: TokenData) -> User | None:
    if not params.username:
        return None

    db_user = session.exec(select(User).where(col(User.username).ilike(params.username.lower()))).first()
    if db_user is None:
        return None

    return db_user
