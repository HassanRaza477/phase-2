---
name: auth-skill
description: Secure signup, signin, password hashing, JWT authentication, and Better Auth integration.
---

# Auth Skill

## Instructions

### Signup & Signin
- Validate user input
- Prevent duplicate accounts
- Return safe and consistent errors

### Password Security
- Hash passwords using bcrypt or argon2
- Never store plaintext passwords
- Use secure password comparison

### JWT Authentication
- Generate short-lived access tokens
- Use refresh tokens securely
- Validate token signature and expiration

### Better Auth Integration
- Configure providers correctly
- Handle callbacks securely
- Normalize user data across providers

## Best Practices
- Follow OWASP authentication guidelines
- Use rate limiting and brute-force protection
- Store tokens in HTTP-only cookies
- Rotate secrets and tokens regularly

