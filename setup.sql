-- 1. Table for Books
CREATE TABLE IF NOT EXISTS books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    quantity INTEGER DEFAULT 1
);

-- 2. Table for Users (Students/Borrowers)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user'
);

-- 3. Table for Book Loans
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    user_id INTEGER,
    issue_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT DEFAULT 'borrowed',
    FOREIGN KEY(book_id) REFERENCES books(book_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
