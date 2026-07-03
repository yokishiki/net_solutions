from sqlmodel import SQLModel, create_engine, Session, select

import app.models as app_models
from app.core.config import DB_NAME
from app.security.password import get_password_hash

sqlite_file_name = DB_NAME
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def add_data_to_tables(session: Session):
    admin_exists = session.exec(
        select(app_models.User).where(app_models.User.username == "admin")
    ).first()

    if not admin_exists:
        admin = app_models.User(
            username="admin",
            password=get_password_hash("admin"),
            is_admin=True
        )
        session.add(admin)
