-- Smart Library Database Schema
-- Run this file to set up the database tables

-- Create Books Table
CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  description TEXT,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_content LONGTEXT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (created_at),
  INDEX (title),
  INDEX (author)
);

-- Create Book Borrowing Table
CREATE TABLE IF NOT EXISTS book_borrowing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  book_id INT NOT NULL,
  borrowed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME,
  returned_date DATETIME NULL,
  status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX (student_id),
  INDEX (book_id),
  INDEX (status),
  INDEX (created_at)
);

-- Create Book Summaries Table
CREATE TABLE IF NOT EXISTS book_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY (book_id),
  INDEX (created_at)
);

-- Create Book Questions Table
CREATE TABLE IF NOT EXISTS book_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  student_id INT NOT NULL,
  question TEXT NOT NULL,
  answer LONGTEXT,
  question_embedding VARCHAR(4096),
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answered_at TIMESTAMP NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (book_id),
  INDEX (student_id),
  INDEX (is_answered),
  INDEX (created_at)
);

-- Create Book Content Embeddings Table (for search)
CREATE TABLE IF NOT EXISTS book_embeddings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  chunk_index INT,
  content_chunk TEXT,
  embedding VARCHAR(4096),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX (book_id),
  INDEX (created_at)
);

-- Create AI Interactions Table (for tracking API calls)
CREATE TABLE IF NOT EXISTS ai_interactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  interaction_type VARCHAR(100),
  input_text LONGTEXT,
  output_text LONGTEXT,
  tokens_used INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX (user_id),
  INDEX (interaction_type),
  INDEX (created_at)
);

-- Create Users Table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  class_name VARCHAR(50),
  level VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (email),
  INDEX (username),
  INDEX (role),
  INDEX (class_name),
  INDEX (level),
  INDEX (created_at)
);
