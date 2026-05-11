const fs = require('fs');
const path = require('path');

// Embed the PDF content for the novels
// These are sample PDFs - in production, you'd download from a source like Project Gutenberg

const novels = [
  {
    title: 'A Man of the People',
    author: 'Chinua Achebe',
    type: 'novel',
    description: 'A satirical novel set in post-independence Nigeria, exploring political corruption and social commentary.',
    category: 'Literature - African Classics'
  },
  {
    title: 'Mine Boy',
    author: 'Peter Abrahams',
    type: 'novel',
    description: 'A classic South African novel about a young man\'s journey from rural life to the gold mines of Johannesburg.',
    category: 'Literature - African Classics'
  },
  {
    title: 'When the Sun Goes Down',
    author: 'Margaret Busby (ed.)',
    type: 'novel',
    description: 'A collection of short stories from contemporary African writers.',
    category: 'Literature - Short Stories'
  }
];

// Create a script to upload these novels
const uploadScript = `#!/bin/bash

# Upload novels to the library system
echo "📚 Uploading African Literature Novels to Library..."
echo ""

UPLOAD_URL="http://localhost:3000/api/books"

# Function to upload a novel
upload_novel() {
    local title=$1
    local author=$2
    local file=$3
    local description=$4
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        return 1
    fi
    
    echo "📤 Uploading: $title by $author..."
    
    response=$(curl -s -X POST \\
        -F "file=@$file" \\
        -F "title=$title" \\
        -F "author=$author" \\
        -F "description=$description" \\
        -F "userId=librarian1" \\
        "$UPLOAD_URL")
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

# Upload each novel
echo "1. Uploading 'A Man of the People'..."
echo "   Author: Chinua Achebe"
echo ""

echo "2. Uploading 'Mine Boy'..."
echo "   Author: Peter Abrahams"
echo ""

echo "3. Uploading 'When the Sun Goes Down'..."
echo ""

echo "✅ Upload process prepared. Download the PDF files and place them in the uploads folder."
echo "Then run: curl -X POST -F 'file=@book.pdf' -F 'title=...' -F 'author=...' http://localhost:3000/api/books"
`;

// Create upload instructions for Windows
const uploadInstructions = `# Upload African Literature Novels to the Library

## Novels to Upload:
1. **A Man of the People** by Chinua Achebe
2. **Mine Boy** by Peter Abrahams  
3. **When the Sun Goes Down** (Editor: Margaret Busby)

## Steps:

### Option 1: Using the Web Interface
1. Open http://localhost:3000/dashboard
2. Look for the "Upload Your Materials" section
3. For each novel:
   - Click "Choose File" and select the PDF
   - Enter Title and Author
   - Set Material Type to "Textbook/Course Material"
   - Click Upload

### Option 2: Using API Curl Command
\`\`\`bash
curl -X POST http://localhost:3000/api/books \\
  -F "file=@path/to/novel.pdf" \\
  -F "title=A Man of the People" \\
  -F "author=Chinua Achebe" \\
  -F "description=A satirical novel set in post-independence Nigeria" \\
  -F "userId=librarian1"
\`\`\`

### Option 3: Using NodeJS Script
\`\`\`javascript
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('a-man-of-the-people.pdf'));
form.append('title', 'A Man of the People');
form.append('author', 'Chinua Achebe');
form.append('description', 'Classic African literature');
form.append('userId', 'librarian1');

fetch('http://localhost:3000/api/books', {
  method: 'POST',
  body: form
}).then(r => r.json()).then(console.log);
\`\`\`

## Where to Download PDFs:

### Free Sources:
- **Project Gutenberg**: https://www.gutenberg.org/
  - Search for: "A Man of the People"
  - Search for: "Mine Boy"
  
- **Open Library**: https://openlibrary.org/
  - Search and download ePub or PDF formats

- **Google Books**: https://books.google.com/
  - Preview and sometimes full text available

- **Standard Ebooks**: https://standardebooks.org/
  - High-quality formatted ebooks

## Verification:

After uploading, verify books are in the system:

\`\`\`bash
curl http://localhost:3000/api/books
\`\`\`

You should see the novels listed with their metadata.

## Notes:
- Maximum file size: 100MB
- Supported formats: PDF, TXT
- PDFs are automatically parsed for content extraction
- AI summaries are generated in the background
- Books are immediately available for students to browse and borrow
`;

// Write the instructions
fs.writeFileSync(
  path.join(process.cwd(), 'NOVEL_UPLOAD_GUIDE.md'),
  uploadInstructions
);

console.log('✅ Upload guide created: NOVEL_UPLOAD_GUIDE.md');
console.log('\nTo upload the novels:');
console.log('1. Download PDF files from Project Gutenberg or Google Books');
console.log('2. Use the upload section in the dashboard OR');
console.log('3. Use the curl command in NOVEL_UPLOAD_GUIDE.md');
console.log('\nAvailable upload endpoints:');
console.log('  POST /api/books - Upload books/textbooks/novels');
console.log('  POST /api/documents/upload - Upload documents');
