-- Migration: 000_create_user_table
-- Created: 2026-02-23
-- Description: Base user table for authentication and chat feature

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User table
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes (idempotent - check if exists first)
CREATE INDEX IF NOT EXISTS idx_users_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON "user"(username);
