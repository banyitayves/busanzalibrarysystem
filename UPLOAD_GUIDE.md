# How to Upload Books & Past Papers to the Library

## ✅ Upload System is Now Ready!

Your library system now supports:
- **PDF and TXT files** (up to 100MB each)
- **Batch uploads** (multiple files at once)
- **Single uploads** with full metadata
- **Automatic PDF text extraction**
- **AI-powered summaries** (generated in background)

---

## Method 1: Using the Web Dashboard (Easiest)

### Single File Upload:
1. Go to: http://localhost:3000/dashboard
2. Find the **"Upload Books & Past Papers"** section
3. Select upload mode: **Single File Upload**
4. Choose material type: (Textbook / Past Paper / Novel / Reference)
5. Enter:
   - **Title**: e.g., "A Man of the People"
   - **Author**: e.g., "Chinua Achebe"
   - **Description**: (Optional) Brief description
6. Click **Choose File** or drag & drop PDF/TXT
7. Click **Upload Book**

### Batch Upload (Multiple Files):
1. Same location in dashboard
2. Select upload mode: **Batch Upload**
3. Choose material type (applies to all files)
4. Click **Select Multiple Files** and choose your PDFs
5. The form will populate with:
   - Auto-generated titles from filenames
   - Fields for manual title and author entry
6. Edit titles and authors as needed
7. Click **Upload N Files**

---

## Method 2: Using cURL Command (Advanced)

```bash
# Single file upload
curl -X POST http://localhost:3000/api/books \
  -F "file=@/path/to/book.pdf" \
  -F "title=A Man of the People" \
  -F "author=Chinua Achebe" \
  -F "description=Classic African novel" \
  -F "userId=librarian1"

# Response example:
# {
#   "id": "uuid-here",
#   "message": "✅ Book uploaded successfully!",
#   "title": "A Man of the People"
# }
```

---

## Method 3: Using PowerShell (Windows)

```powershell
# Upload a single book
$file = "C:\path\to\book.pdf"
$title = "A Man of the People"
$author = "Chinua Achebe"

$body = @{
    file = Get-Item $file
    title = $title
    author = $author
    userId = "librarian1"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/books" `
    -Method POST `
    -Form $body
```

---

## Uploading the Specific Novels

### 1. **A Man of the People** by Chinua Achebe
- **Description**: A satirical novel set in post-independence Nigeria, exploring political corruption and social commentary.
- **Category**: Literature - African Classics
- **Download from**:
  - Project Gutenberg: https://www.gutenberg.org/ (search for author name)
  - Google Books: https://books.google.com/
  - Standard Ebooks: https://standardebooks.org/

### 2. **Mine Boy** by Peter Abrahams
- **Description**: A classic South African novel about a young man's journey from rural life to the gold mines of Johannesburg.
- **Category**: Literature - African Classics
- **Download from**:
  - Project Gutenberg
  - Open Library: https://openlibrary.org/
  - Google Books

### 3. **When the Sun Goes Down**
- **Description**: A collection of short stories from contemporary African writers.
- **Category**: Literature - Short Stories
- **Download from**:
  - Various free ebook platforms
  - Publisher websites (may have free samples)

---

## Step-by-Step: Downloading & Uploading Novels

### For Project Gutenberg (Recommended):

1. **Visit**: https://www.gutenberg.org/
2. **Search**: for "A Man of the People" or author name
3. **Click** the book result
4. **Download** as: **PDF** or **Plain Text UTF-8**
5. **Save** to a folder on your computer
6. **Upload** using the web dashboard or curl command

### For Google Books:

1. **Visit**: https://books.google.com/
2. **Search**: for the book
3. **Look for**: Download option or "Read Full Text" (some books available)
4. **Download**: as PDF if available
5. **Upload** as above

### For Open Library:

1. **Visit**: https://openlibrary.org/
2. **Search**: for the book
3. **Click** "Borrow" or "Read Online"
4. **Download**: using available download links
5. **Upload** to your library system

---

## Verifying Uploaded Books

### Check via Web Dashboard:
- Go to: http://localhost:3000/dashboard
- Look for recently uploaded books in the library view
- Books should be searchable by title and author

### Check via API:
```bash
curl http://localhost:3000/api/books | jq '.'
```

### Check via Import Endpoint:
```bash
curl http://localhost:3000/api/import | jq '.books'
```

---

## Troubleshooting

### Issue: "File too large. Maximum 100MB allowed"
- **Solution**: The file exceeds 100MB. Try:
  - Compressing the PDF
  - Splitting into multiple files
  - Using a text version instead

### Issue: "Only PDF and TXT files are supported"
- **Solution**: Ensure your file is:
  - .pdf file, OR
  - .txt file
- Not: .docx, .epub, .doc, etc.

### Issue: Upload button doesn't appear
- **Solution**:
  1. Refresh the page (Ctrl+R)
  2. Clear browser cache
  3. Check if server is running: `npm run dev`

### Issue: Upload fails silently
- **Check browser console** (F12) for errors
- **Check server logs** in terminal
- **Verify file format** is valid PDF or TXT

---

## Features After Upload

Once uploaded, your books will be:

✅ **Searchable** - By title, author, category
✅ **Readable** - PDF text is extracted and indexed
✅ **Summarized** - AI generates summaries automatically
✅ **Accessible** - Students can view and borrow
✅ **Organized** - Sorted by category and date
✅ **Protected** - Secure access with user authentication

---

## Example: Complete Upload Workflow

```bash
# 1. Download A Man of the People from Project Gutenberg
wget https://www.gutenberg.org/cache/epub/[id]/pg[id]-0.txt \
     -O "a-man-of-the-people.txt"

# 2. Upload using curl
curl -X POST http://localhost:3000/api/books \
  -F "file=@a-man-of-the-people.txt" \
  -F "title=A Man of the People" \
  -F "author=Chinua Achebe" \
  -F "description=A satirical novel set in post-independence Nigeria" \
  -F "userId=librarian1"

# 3. Verify it was uploaded
curl http://localhost:3000/api/books | jq '.[0]'

# 4. Share with students via dashboard
# http://localhost:3000/dashboard
```

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/books` | POST | Upload a single book |
| `/api/books` | GET | List all uploaded books |
| `/api/import` | POST | Batch import from CSV |
| `/api/import` | GET | View imported books |
| `/api/documents/upload` | POST | Upload document metadata |

---

## Support

For issues or questions:
1. Check the **console logs** (F12 in browser)
2. Check the **server terminal** for errors
3. Verify **file format** (PDF or TXT only)
4. Ensure **file size** < 100MB
5. Make sure **server is running** (`npm run dev`)

---

**Happy uploading! 📚📖✨**
