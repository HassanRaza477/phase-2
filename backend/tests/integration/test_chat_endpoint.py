"""
Integration Tests for Chat Endpoint

Tests the complete chat API endpoint including authentication, conversation management,
and agent integration.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from datetime import datetime
from uuid import uuid4
import jwt
import os

from ..src.main import app
from ..src.db.database import get_db
from ..src.models.conversation import Conversation
from ..src.models.message import Message


# Test database setup
@pytest.fixture(name="session")
def create_test_session():
    """Create in-memory SQLite database for testing"""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def client(session):
    """Create test client with database override"""
    def get_test_db():
        return session
    
    app.dependency_overrides[get_db] = get_test_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_id():
    """Generate test user ID"""
    return uuid4()


@pytest.fixture
def jwt_secret():
    """Get or set test JWT secret"""
    secret = "test-secret-key-for-integration-testing"
    os.environ["JWT_SECRET_KEY"] = secret
    os.environ["JWT_ALGORITHM"] = "HS256"
    return secret


@pytest.fixture
def auth_header(test_user_id, jwt_secret):
    """Create valid JWT authorization header"""
    payload = {
        "sub": str(test_user_id),
        "email": "test@example.com",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, jwt_secret, algorithm="HS256")
    return f"Bearer {token}"


@pytest.fixture
def expired_auth_header(test_user_id, jwt_secret):
    """Create expired JWT authorization header"""
    from datetime import timedelta
    
    payload = {
        "sub": str(test_user_id),
        "email": "test@example.com",
        "iat": datetime.utcnow() - timedelta(hours=2),
        "exp": datetime.utcnow() - timedelta(hours=1)
    }
    token = jwt.encode(payload, jwt_secret, algorithm="HS256")
    return f"Bearer {token}"


class TestChatEndpointAuthentication:
    """Test chat endpoint authentication"""
    
    def test_chat_without_auth_returns_401(self, client, test_user_id):
        """Test chat endpoint without authentication returns 401"""
        response = client.post(
            f"/api/{test_user_id}/chat",
            json={"message": "Hello"}
        )
        
        assert response.status_code == 401
        assert response.json()["detail"]["code"] == "MISSING_AUTHORIZATION"
    
    def test_chat_with_invalid_token_returns_401(self, client, test_user_id):
        """Test chat endpoint with invalid token returns 401"""
        response = client.post(
            f"/api/{test_user_id}/chat",
            json={"message": "Hello"},
            headers={"Authorization": "Bearer invalid-token"}
        )
        
        assert response.status_code == 401
    
    def test_chat_with_expired_token_returns_401(self, client, test_user_id, expired_auth_header):
        """Test chat endpoint with expired token returns 401"""
        response = client.post(
            f"/api/{test_user_id}/chat",
            json={"message": "Hello"},
            headers={"Authorization": expired_auth_header}
        )
        
        assert response.status_code == 401
        assert response.json()["detail"]["code"] == "TOKEN_EXPIRED"
    
    def test_chat_with_user_mismatch_returns_403(self, client, jwt_secret):
        """Test chat endpoint with mismatched user ID returns 403"""
        # Create token for user A
        user_a = uuid4()
        payload = {
            "sub": str(user_a),
            "email": "usera@example.com",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, jwt_secret, algorithm="HS256")
        
        # Try to access user B's endpoint
        user_b = uuid4()
        response = client.post(
            f"/api/{user_b}/chat",
            json={"message": "Hello"},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403
        assert response.json()["detail"]["code"] == "USER_ID_MISMATCH"


class TestChatEndpointValidation:
    """Test chat endpoint input validation"""
    
    def test_chat_with_empty_message_returns_400(self, client, test_user_id, auth_header):
        """Test chat endpoint with empty message returns 400"""
        response = client.post(
            f"/api/{test_user_id}/chat",
            json={"message": ""},
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "INVALID_MESSAGE"
    
    def test_chat_with_whitespace_message_returns_400(self, client, test_user_id, auth_header):
        """Test chat endpoint with whitespace-only message returns 400"""
        response = client.post(
            f"/api/{test_user_id}/chat",
            json={"message": "   "},
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 400
    
    def test_chat_with_very_long_message_returns_400(self, client, test_user_id, auth_header):
        """Test chat endpoint with message > 4000 chars returns 400"""
        long_message = "a" * 4001
        
        response = client.post(
            f"/api/{test_user_id}/chat",
            json={"message": long_message},
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "MESSAGE_TOO_LONG"


class TestConversationManagement:
    """Test conversation creation and retrieval"""
    
    def test_chat_creates_new_conversation(self, client, test_user_id, auth_header, session):
        """Test that chat endpoint creates new conversation when none exists"""
        # Mock agent response (since we can't call OpenAI in tests)
        # For now, just test that the endpoint accepts valid input
        # Note: This test will fail until we mock the agent
        
        # Initial conversation count
        initial_count = session.query(Conversation).count()
        
        # This would test conversation creation, but requires agent mocking
        # TODO: Mock process_agent_message to return a test response
        pytest.skip("Requires agent mocking - integration test placeholder")
    
    def test_chat_with_invalid_conversation_id_returns_404(self, client, test_user_id, auth_header):
        """Test chat endpoint with non-existent conversation returns 404"""
        fake_conversation_id = uuid4()
        
        response = client.post(
            f"/api/{test_user_id}/chat",
            json={
                "message": "Hello",
                "conversation_id": str(fake_conversation_id)
            },
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 404
        assert response.json()["detail"]["code"] == "CONVERSATION_NOT_FOUND"


class TestConversationsListEndpoint:
    """Test GET /api/{user_id}/conversations endpoint"""
    
    def test_list_conversations_without_auth_returns_401(self, client, test_user_id):
        """Test list conversations without authentication returns 401"""
        response = client.get(f"/api/{test_user_id}/conversations")
        
        assert response.status_code == 401
    
    def test_list_conversations_returns_empty_list(self, client, test_user_id, auth_header, session):
        """Test list conversations returns empty list for new user"""
        response = client.get(
            f"/api/{test_user_id}/conversations",
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["conversations"] == []
        assert data["total"] == 0
        assert data["limit"] == 20
        assert data["offset"] == 0
    
    def test_list_conversations_with_pagination(self, client, test_user_id, auth_header, session):
        """Test list conversations with pagination parameters"""
        response = client.get(
            f"/api/{test_user_id}/conversations?limit=10&offset=5",
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 10
        assert data["offset"] == 5


class TestConversationGetEndpoint:
    """Test GET /api/{user_id}/conversations/{conversation_id} endpoint"""
    
    def test_get_conversation_without_auth_returns_401(self, client, test_user_id):
        """Test get conversation without authentication returns 401"""
        fake_id = uuid4()
        response = client.get(f"/api/{test_user_id}/conversations/{fake_id}")
        
        assert response.status_code == 401
    
    def test_get_nonexistent_conversation_returns_404(self, client, test_user_id, auth_header):
        """Test get non-existent conversation returns 404"""
        fake_id = uuid4()
        
        response = client.get(
            f"/api/{test_user_id}/conversations/{fake_id}",
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 404
        assert response.json()["detail"]["code"] == "CONVERSATION_NOT_FOUND"


class TestConversationDeleteEndpoint:
    """Test DELETE /api/{user_id}/conversations/{conversation_id} endpoint"""
    
    def test_delete_conversation_without_auth_returns_401(self, client, test_user_id):
        """Test delete conversation without authentication returns 401"""
        fake_id = uuid4()
        response = client.delete(f"/api/{test_user_id}/conversations/{fake_id}")
        
        assert response.status_code == 401
    
    def test_delete_nonexistent_conversation_returns_404(self, client, test_user_id, auth_header):
        """Test delete non-existent conversation returns 404"""
        fake_id = uuid4()
        
        response = client.delete(
            f"/api/{test_user_id}/conversations/{fake_id}",
            headers={"Authorization": auth_header}
        )
        
        assert response.status_code == 404


# Import timedelta for fixtures
from datetime import timedelta
