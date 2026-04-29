import getPool from './db';

export async function initializeDatabase() {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    // Create Users table
    await connection.execute(`
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
      )
    `);

    // Create Books table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        description TEXT,
        file_path VARCHAR(255) NOT NULL,
        file_type VARCHAR(50),
        file_content LONGTEXT,
        file_size BIGINT DEFAULT 0,
        is_document BOOLEAN DEFAULT FALSE,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX (created_at),
        INDEX (uploaded_by)
      )
    `);

    // Alter table to add columns if they don't exist
    try {
      await connection.execute(`ALTER TABLE books ADD COLUMN file_size BIGINT DEFAULT 0`);
    } catch (e) {
      // Column might already exist
    }

    try {
      await connection.execute(`ALTER TABLE books ADD COLUMN is_document BOOLEAN DEFAULT FALSE`);
    } catch (e) {
      // Column might already exist
    }

    // Create Book Borrowing table
    await connection.execute(`
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
        INDEX (status)
      )
    `);

    // Create Book Summaries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS book_summaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        book_id INT NOT NULL,
        summary TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE KEY (book_id)
      )
    `);

    // Create Book Questions table
    await connection.execute(`
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
        INDEX (is_answered)
      )
    `);

    // Create Book Content Embeddings table (for search)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS book_embeddings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        book_id INT NOT NULL,
        chunk_index INT,
        content_chunk TEXT,
        embedding VARCHAR(4096),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        INDEX (book_id)
      )
    `);

    // Create AI Interactions table (for tracking API calls)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ai_interactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        interaction_type VARCHAR(100),
        input_text LONGTEXT,
        output_text LONGTEXT,
        tokens_used INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create Courses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor VARCHAR(255),
        category VARCHAR(100),
        video_url VARCHAR(500),
        duration VARCHAR(50),
        students_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (category),
        INDEX (created_at)
      )
    `);

    // Create Course Enrollments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress INT DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (student_id, course_id),
        INDEX (student_id),
        INDEX (course_id),
        INDEX (enrolled_at)
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}
