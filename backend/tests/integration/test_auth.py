import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from backend.src.main import app
from backend.src.db.database import get_session
from backend.src.models.user import User


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(bind=engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_register_user(client: TestClient):
    response = client.post("/auth/register", json={
        "email": "testuser@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert "id" in data