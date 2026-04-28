import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';

const SAMPLE_BOOKS = [
  {
    title: 'Introduction to Programming with Python',
    author: 'John Smith',
    description: 'Learn the basics of Python programming for beginners',
    content: `Chapter 1: Getting Started with Python

Python is a high-level, interpreted programming language known for its simplicity and readability. 
It was created by Guido van Rossum in 1991 and has since become one of the most popular programming languages.

1.1 Why Python?
- Simple and easy to learn
- Readable and well-structured syntax
- Wide range of libraries and frameworks
- Used in data science, web development, AI, and more
- Great community support

1.2 Setting Up Python
To start programming with Python, you need to:
1. Download Python from python.org
2. Install it on your computer
3. Choose a text editor or IDE (PyCharm, VS Code, etc.)
4. Write your first program

1.3 Your First Program
The traditional first program is "Hello World". Here's how to do it in Python:

print("Hello, World!")

This simple line of code will output "Hello, World!" to the screen. The print() function is one of the most 
commonly used functions in Python for displaying output.

1.4 Basic Concepts
- Variables: Store data values
- Data Types: int, float, str, bool, list, tuple, dict
- Operators: +, -, *, /, //, %, **
- Control Flow: if, elif, else, for, while

Chapter 2: Variables and Data Types

Variables are like containers that store data values. In Python, you don't need to declare the type of variable 
because Python figures it out automatically.

2.1 Creating Variables
x = 5
y = "Hello"
z = 3.14

2.2 Data Types
- Integers: Whole numbers like 1, 2, 3
- Floats: Decimal numbers like 3.14, 2.5
- Strings: Text data like "Hello World"
- Booleans: True or False
- Lists: Ordered collections like [1, 2, 3]
- Dictionaries: Key-value pairs like {"name": "John", "age": 30}

Understanding data types is crucial for writing correct programs.`,
  },
  {
    title: 'Web Development with HTML, CSS, and JavaScript',
    author: 'Sarah Johnson',
    description: 'Master the fundamentals of modern web development',
    content: `Chapter 1: Introduction to Web Development

Web development is the process of creating and building websites and web applications that run on the internet. 
It involves multiple technologies and programming languages working together to create interactive user experiences.

1.1 The Three Pillars of Web Development
1. HTML (HyperText Markup Language) - Structure
2. CSS (Cascading Style Sheets) - Styling
3. JavaScript - Interactivity

1.2 Understanding the Web
- Clients (browsers) request content from servers
- Servers respond with HTML, CSS, JavaScript, and other resources
- The browser renders this content into a viewable webpage
- JavaScript runs in the browser to add interactivity

1.3 Setting Up Your Environment
- Text Editor: VS Code, Sublime Text, Atom
- Browser: Chrome, Firefox, Safari
- Developer Tools: Built into most browsers (F12)

Chapter 2: HTML Basics

HTML is the foundation of every website. It provides the structure and content of web pages using elements called tags.

2.1 HTML Structure
<!DOCTYPE html>
<html>
<head>
    <title>My Web Page</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is a paragraph of text.</p>
</body>
</html>

2.2 Common HTML Tags
- <h1> to <h6>: Headings
- <p>: Paragraphs
- <a>: Links
- <img>: Images
- <div>: Container
- <button>: Buttons
- <form>: Forms for user input

2.3 Best Practices
- Use semantic HTML (header, nav, main, footer)
- Always include proper meta tags
- Make your code readable with proper indentation
- Use descriptive names for IDs and classes

Chapter 3: CSS Styling

CSS allows you to style and layout HTML elements. It controls colors, fonts, spacing, and positioning.

3.1 Ways to Apply CSS
- Inline: style attribute on HTML elements
- Internal: <style> tag in HTML head
- External: Link to .css file

3.2 CSS Selectors
- Element: p { color: blue; }
- Class: .classname { color: red; }
- ID: #idname { color: green; }
- Attribute: [type="text"] { border: 1px solid blue; }

3.3 Box Model
Every HTML element has padding, border, margin, and content that make up the box model.
Understanding this is crucial for proper layout.`,
  },
  {
    title: 'Data Science and Machine Learning Fundamentals',
    author: 'Dr. Michael Chen',
    description: 'Comprehensive guide to data science and ML basics',
    content: `Chapter 1: Introduction to Data Science

Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to 
extract knowledge and insights from structured and unstructured data.

1.1 What is Data Science?
Data Science combines:
- Statistics and Mathematics
- Computer Science and Programming
- Domain Knowledge and Business Understanding

1.2 The Data Science Lifecycle
1. Problem Definition: Understand what you're trying to solve
2. Data Collection: Gather relevant data
3. Data Cleaning: Prepare and preprocess data
4. Exploratory Analysis: Understand patterns and relationships
5. Feature Engineering: Create meaningful features
6. Model Building: Train machine learning models
7. Evaluation: Test and validate models
8. Deployment: Put models into production
9. Monitoring: Track performance over time

1.3 Tools and Technologies
- Programming Languages: Python, R, SQL
- Libraries: Pandas, NumPy, Scikit-learn, TensorFlow
- Visualization: Matplotlib, Seaborn, Tableau
- Databases: SQL, NoSQL

Chapter 2: Machine Learning Basics

Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience.

2.1 Types of Machine Learning
- Supervised Learning: Learn from labeled data
  - Regression: Predict continuous values
  - Classification: Predict categories
- Unsupervised Learning: Find patterns in unlabeled data
  - Clustering: Group similar items
  - Dimensionality Reduction: Reduce features
- Reinforcement Learning: Learn through rewards and penalties

2.2 Common Algorithms
- Decision Trees: Simple and interpretable
- Random Forest: Ensemble method for robustness
- Linear Regression: For continuous predictions
- Logistic Regression: For binary classification
- K-Means: For clustering
- Neural Networks: For complex pattern recognition

2.3 Model Evaluation
- Accuracy: Percentage of correct predictions
- Precision: Positive predictions that are correct
- Recall: Actual positives correctly identified
- F1-Score: Balance between precision and recall
- ROC Curve: Evaluate classification performance

Chapter 3: Working with Data

Data is the foundation of data science and machine learning.

3.1 Data Types
- Numerical: Integers, floats
- Categorical: Classes, labels
- Text: Strings, documents
- Time Series: Sequential data
- Images: Visual data

3.2 Data Quality
- Missing Values: Handle with imputation or removal
- Outliers: Identify and treat appropriately
- Duplicates: Remove duplicate records
- Inconsistency: Standardize formats

3.3 Feature Engineering
- Creating new features from existing data
- Scaling: Normalize or standardize features
- Encoding: Convert categorical to numerical
- Selection: Choose most important features`,
  },
  {
    title: 'English Literature: Classic Novels and Analysis',
    author: 'Prof. Emma Wilson',
    description: 'Study of classic literature and literary analysis techniques',
    content: `Chapter 1: Introduction to Literature

Literature is the written or oral artistic expression of a culture or a people. It encompasses novels, poetry, 
drama, essays, and other forms of creative writing.

1.1 Why Study Literature?
- Understand human experience and culture
- Develop critical thinking skills
- Improve communication abilities
- Explore different perspectives and ideas
- Appreciate artistic expression

1.2 Types of Literature
- Fiction: Imaginative narratives including novels and short stories
- Poetry: Artistic expression using language and form
- Drama: Works written for performance on stage
- Non-fiction: True accounts and essays
- Biography: Life stories of real people

1.3 Literary Periods
- Classical Literature: Ancient Greece and Rome
- Medieval Literature: 5th-15th centuries
- Renaissance Literature: 14th-17th centuries
- Romantic Period: 18th-19th centuries
- Victorian Era: 19th century
- Modern Literature: 20th century onwards

Chapter 2: Elements of Fiction

Fiction includes several key elements that work together to create a complete story.

2.1 Plot
The sequence of events that make up a story. A typical plot structure includes:
- Exposition: Introduction of characters and setting
- Rising Action: Events that build tension
- Climax: The turning point and moment of greatest intensity
- Falling Action: Events after the climax
- Resolution: The conclusion of the story

2.2 Characters
- Protagonist: Main character
- Antagonist: Character opposing the protagonist
- Flat: One-dimensional characters
- Round: Complex, multidimensional characters
- Dynamic: Characters who change throughout the story
- Static: Characters who remain the same

2.3 Setting
The time, place, and environment of the story. Setting can include:
- Physical location
- Historical period
- Social and cultural context
- Atmosphere and mood

2.4 Point of View
- First Person: "I" narrator, limited perspective
- Second Person: "You" narrator, rare usage
- Third Person Limited: Narrator knows one character's thoughts
- Third Person Omniscient: Narrator knows all characters' thoughts

Chapter 3: Literary Devices and Techniques

Writers use various literary devices to enhance their work and create meaning.

3.1 Figurative Language
- Metaphor: Direct comparison without "like" or "as"
- Simile: Comparison using "like" or "as"
- Personification: Giving human qualities to non-human things
- Symbolism: Using objects to represent abstract ideas
- Irony: When reality is opposite to expectations
- Foreshadowing: Hints at future events

3.2 Tone and Style
- Tone: Author's attitude toward subject and reader
- Style: Unique way an author uses language
- Diction: Choice of words
- Syntax: Arrangement of words in sentences

3.3 Themes
Central ideas or meanings in a work of literature. Common themes include:
- Love and relationships
- Good versus evil
- Individual versus society
- Coming of age
- The search for identity`,
  },
  {
    title: 'Mathematics: Algebra and Geometry Essentials',
    author: 'Dr. Robert Taylor',
    description: 'Fundamental concepts in algebra and geometry',
    content: `Chapter 1: Introduction to Algebra

Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas 
and equations. It allows us to solve problems and make generalizations about relationships.

1.1 Basic Concepts
- Variables: Letters that represent unknown values (x, y, z)
- Constants: Fixed numerical values
- Coefficients: Numbers multiplied by variables
- Terms: Parts of expressions separated by + or -
- Expressions: Combinations of terms (2x + 3)
- Equations: Statements that two expressions are equal (2x + 3 = 7)

1.2 Order of Operations
PEMDAS/BODMAS:
1. Parentheses/Brackets
2. Exponents/Orders
3. Multiplication and Division (left to right)
4. Addition and Subtraction (left to right)

1.3 Solving Linear Equations
To solve x + 5 = 12:
- Subtract 5 from both sides
- x + 5 - 5 = 12 - 5
- x = 7

Steps:
1. Identify the variable
2. Use inverse operations
3. Simplify both sides
4. Check your solution

Chapter 2: Quadratic Equations

Quadratic equations are polynomial equations of the second degree (highest power is 2).

2.1 Standard Form
ax² + bx + c = 0, where a ≠ 0

2.2 Methods of Solution
- Factoring: Break into two binomials
- Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a
- Completing the Square: Rewrite to isolate the variable
- Graphing: Find x-intercepts

2.3 Applications
- Physics: Motion and trajectory problems
- Economics: Cost and revenue analysis
- Engineering: Design and optimization

Chapter 3: Introduction to Geometry

Geometry is the study of shapes, sizes, and properties of figures and spaces.

3.1 Basic Shapes
- Triangle: 3 sides, angles sum to 180°
- Square: 4 equal sides, all right angles
- Rectangle: 4 sides, opposite sides equal, all right angles
- Circle: All points equidistant from center
- Polygon: Closed figure with multiple sides

3.2 Area and Perimeter
- Rectangle: Area = length × width, Perimeter = 2(l + w)
- Triangle: Area = ½ × base × height
- Circle: Area = πr², Circumference = 2πr
- Square: Area = s², Perimeter = 4s

3.3 3D Shapes
- Cube: 6 square faces, Volume = s³
- Rectangular Prism: Volume = l × w × h
- Sphere: Volume = ⁴⁄₃πr³
- Cylinder: Volume = πr²h

Chapter 4: Theorems and Proofs

4.1 Pythagorean Theorem
In a right triangle: a² + b² = c²
where c is the hypotenuse and a, b are the other sides.

4.2 Properties of Triangles
- Isosceles Triangle: Two equal sides and angles
- Equilateral Triangle: All sides and angles equal
- Right Triangle: One 90° angle
- Congruent Triangles: Same size and shape
- Similar Triangles: Same shape, different sizes`,
  },
];

export async function POST(request: NextRequest) {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Insert sample books
      for (const book of SAMPLE_BOOKS) {
        // Check if book already exists
        const [existing] = await connection.execute(
          'SELECT id FROM books WHERE title = ?',
          [book.title]
        );

        if ((existing as any[]).length === 0) {
          // Insert the book
          const [result] = await connection.execute(
            `INSERT INTO books (title, author, description, file_path, file_type, file_content, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?, NULL)`,
            [
              book.title,
              book.author,
              book.description,
              `/samples/${book.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
              'pdf',
              book.content,
            ]
          );

          const bookId = (result as any).insertId;

          // Generate and save a summary
          const summary = `AI-Generated Summary: "${book.title}" by ${book.author}\n\n${book.content.substring(0, 500)}...\n\n[This is a sample book summary for testing purposes]`;

          await connection.execute(
            `INSERT INTO book_summaries (book_id, summary) VALUES (?, ?)`,
            [bookId, summary]
          );

          console.log(`✓ Added sample book: ${book.title}`);
        }
      }

      return NextResponse.json(
        { message: 'Sample books loaded successfully', count: SAMPLE_BOOKS.length },
        { status: 201 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error loading sample books:', error);
    return NextResponse.json(
      { error: 'Failed to load sample books', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get count of books
      const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
      const bookCount = (books as any[])[0].count;

      return NextResponse.json({
        message: 'Sample books status',
        currentBooks: bookCount,
        availableSamples: SAMPLE_BOOKS.length,
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error checking sample books:', error);
    return NextResponse.json(
      { error: 'Failed to check books', details: String(error) },
      { status: 500 }
    );
  }
}
