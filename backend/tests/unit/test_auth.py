"""
Unit Tests for JWT Authentication Service

Tests the JWT verification functionality in services/auth.py
"""
import pytest
import jwt
import os
from datetime import datetime, timedelta
from uuid import uuid4, UUID

from ..src.services.auth import (
    verify_jwt_token,
    get_current_user_from_token,
    validate_user_match,
    JWTVerificationError
)


# Test fixtures
@pytest.fixture
def valid_user_id():
    """Generate a valid UUID for testing"""
    return uuid4()


@pytest.fixture
def jwt_secret():
    """Get JWT secret from environment or use test value"""
    return os.getenv("JWT_SECRET_KEY", "test-secret-key-for-testing")


@pytest.fixture
def valid_token(valid_user_id, jwt_secret):
    """Create a valid JWT token for testing"""
    payload = {
        "sub": str(valid_user_id),
        "email": "test@example.com",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, jwt_secret, algorithm="HS256")


@pytest.fixture
def expired_token(valid_user_id, jwt_secret):
    """Create an expired JWT token for testing"""
    payload = {
        "sub": str(valid_user_id),
        "email": "test@example.com",
        "iat": datetime.utcnow() - timedelta(hours=2),
        "exp": datetime.utcnow() - timedelta(hours=1)
    }
    return jwt.encode(payload, jwt_secret, algorithm="HS256")


@pytest.fixture
def invalid_signature_token(valid_user_id):
    """Create a token with invalid signature"""
    payload = {
        "sub": str(valid_user_id),
        "email": "test@example.com",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, "wrong-secret", algorithm="HS256")


class TestVerifyJWTToken:
    """Tests for verify_jwt_token function"""
    
    def test_valid_token_returns_user_id(self, valid_token, valid_user_id, monkeypatch):
        """Test that a valid token returns the correct user ID"""
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        result = verify_jwt_token(valid_token)
        
        assert isinstance(result, UUID)
        assert result == valid_user_id
    
    def test_expired_token_raises_401(self, expired_token, monkeypatch):
        """Test that an expired token raises HTTPException 401"""
        from fastapi import HTTPException
        
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        with pytest.raises(HTTPException) as exc_info:
            verify_jwt_token(expired_token)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail["code"] == "TOKEN_EXPIRED"
    
    def test_invalid_signature_raises_401(self, invalid_signature_token, monkeypatch):
        """Test that a token with invalid signature raises HTTPException 401"""
        from fastapi import HTTPException
        
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        with pytest.raises(HTTPException) as exc_info:
            verify_jwt_token(invalid_signature_token)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail["code"] == "INVALID_TOKEN"
    
    def test_malformed_token_raises_401(self, monkeypatch):
        """Test that a malformed token raises HTTPException 401"""
        from fastapi import HTTPException
        
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        with pytest.raises(HTTPException) as exc_info:
            verify_jwt_token("not.a.valid.jwt.token")
        
        assert exc_info.value.status_code == 401
    
    def test_missing_secret_key_raises_500(self, valid_token, monkeypatch):
        """Test that missing JWT_SECRET_KEY raises HTTPException 500"""
        from fastapi import HTTPException
        
        monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
        
        with pytest.raises(HTTPException) as exc_info:
            verify_jwt_token(valid_token)
        
        assert exc_info.value.status_code == 500
        assert exc_info.value.detail["code"] == "CONFIGURATION_ERROR"
    
    def test_invalid_user_id_format_raises_401(self, monkeypatch):
        """Test that token with invalid UUID format raises HTTPException 401"""
        from fastapi import HTTPException
        
        # Create token with invalid UUID
        payload = {
            "sub": "not-a-valid-uuid",
            "email": "test@example.com",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        invalid_uuid_token = jwt.encode(payload, "test-secret-key-for-testing", algorithm="HS256")
        
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        with pytest.raises(HTTPException) as exc_info:
            verify_jwt_token(invalid_uuid_token)
        
        assert exc_info.value.status_code == 401


class TestGetCurrentUserFromToken:
    """Tests for get_current_user_from_token function"""
    
    def test_valid_authorization_header(self, valid_token, valid_user_id, monkeypatch):
        """Test valid Authorization header returns user ID"""
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        auth_header = f"Bearer {valid_token}"
        result = get_current_user_from_token(auth_header)
        
        assert result == valid_user_id
    
    def test_missing_authorization_header_raises_401(self):
        """Test missing Authorization header raises HTTPException 401"""
        from fastapi import HTTPException
        
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_from_token(None)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail["code"] == "MISSING_AUTHORIZATION"
    
    def test_invalid_authorization_format_raises_401(self, valid_token):
        """Test invalid Authorization format raises HTTPException 401"""
        from fastapi import HTTPException
        
        # Missing "Bearer " prefix
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_from_token(valid_token)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail["code"] == "INVALID_AUTHORIZATION_FORMAT"
    
    def test_wrong_scheme_raises_401(self, valid_token):
        """Test wrong scheme (e.g., "Basic" instead of "Bearer") raises HTTPException 401"""
        from fastapi import HTTPException
        
        auth_header = f"Basic {valid_token}"
        
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_from_token(auth_header)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail["code"] == "INVALID_AUTHORIZATION_FORMAT"


class TestValidateUserMatch:
    """Tests for validate_user_match function"""
    
    def test_matching_user_ids_no_exception(self, valid_user_id):
        """Test that matching user IDs don't raise exception"""
        # Should not raise any exception
        validate_user_match(valid_user_id, valid_user_id)
    
    def test_mismatched_user_ids_raises_403(self, valid_user_id):
        """Test that mismatched user IDs raise HTTPException 403"""
        from fastapi import HTTPException
        
        different_user_id = uuid4()
        
        with pytest.raises(HTTPException) as exc_info:
            validate_user_match(valid_user_id, different_user_id)
        
        assert exc_info.value.status_code == 403
        assert exc_info.value.detail["code"] == "USER_ID_MISMATCH"


# Integration-style tests
class TestJWTAuthenticationFlow:
    """Integration tests for complete JWT authentication flow"""
    
    def test_complete_auth_flow(self, monkeypatch):
        """Test complete authentication flow from token to user validation"""
        from fastapi import HTTPException
        
        # Setup
        user_id = uuid4()
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        # Create token
        payload = {
            "sub": str(user_id),
            "email": "test@example.com",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, "test-secret-key-for-testing", algorithm="HS256")
        
        # Verify token
        auth_header = f"Bearer {token}"
        authenticated_user = get_current_user_from_token(auth_header)
        
        # Validate user match
        validate_user_match(authenticated_user, user_id)
        
        # Should complete without exceptions
        assert authenticated_user == user_id
    
    def test_auth_flow_with_mismatch(self, monkeypatch):
        """Test authentication flow with user ID mismatch"""
        from fastapi import HTTPException
        
        # Setup
        user_id = uuid4()
        different_user_id = uuid4()
        monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing")
        monkeypatch.setenv("JWT_ALGORITHM", "HS256")
        
        # Create token
        payload = {
            "sub": str(user_id),
            "email": "test@example.com",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, "test-secret-key-for-testing", algorithm="HS256")
        
        # Verify token
        auth_header = f"Bearer {token}"
        authenticated_user = get_current_user_from_token(auth_header)
        
        # Try to validate with different user ID - should fail
        with pytest.raises(HTTPException) as exc_info:
            validate_user_match(authenticated_user, different_user_id)
        
        assert exc_info.value.status_code == 403
