CREATE DATABASE IF NOT EXISTS cinematch;
USE cinematch;

-- Users Table for Authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist Table
CREATE TABLE IF NOT EXISTS watchlist (
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255),
  release_date VARCHAR(50),
  vote_average DOUBLE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255) NOT NULL,
  poster_path VARCHAR(255),
  release_date VARCHAR(50),
  vote_average DOUBLE,
  timestamp BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_movie (user_id, movie_id)
);

-- Seed guest account for testing
INSERT INTO users (username, email, password) VALUES 
('guest', 'guest@cinematch.com', '$2a$10$T8VqUoE1o72tM0q48T6LkeC65dC65hE.6k9v26K4G6.m96e166T8u') -- Password is 'password123'
ON DUPLICATE KEY UPDATE username=username;
