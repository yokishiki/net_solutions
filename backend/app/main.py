from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from sqlmodel import Session
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import create_db_and_tables, add_data_to_tables, engine
from app.routers import appications, auth
from app.core.exceptions import CredentialException


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        try:
            add_data_to_tables(session)
        except Exception as e:
            print(e)
        session.commit()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(appications.router)
app.include_router(auth.router)


@app.exception_handler(CredentialException)
async def credential_exception_handler(e: CredentialException):
    return PlainTextResponse(str(e.message), status_code=status.HTTP_401_UNAUTHORIZED)
