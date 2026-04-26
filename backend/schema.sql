-- Employee Performance Evaluation System (HR-Core)
-- Database: PostgreSQL

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    total_score FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    weight INT NOT NULL DEFAULT 1,
    calculated_score FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update total_score in users table whenever a skill is added/updated/deleted
CREATE OR REPLACE FUNCTION update_user_total_score()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE users 
        SET total_score = (SELECT COALESCE(SUM(calculated_score), 0) FROM skills WHERE user_id = OLD.user_id)
        WHERE id = OLD.user_id;
        RETURN OLD;
    ELSE
        UPDATE users 
        SET total_score = (SELECT COALESCE(SUM(calculated_score), 0) FROM skills WHERE user_id = NEW.user_id)
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_total_score
AFTER INSERT OR UPDATE OR DELETE ON skills
FOR EACH ROW EXECUTE FUNCTION update_user_total_score();
