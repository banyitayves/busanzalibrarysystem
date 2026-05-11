const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Novel URLs and metadata
const novels = [
  {
    id: 'a_man_of_the_people',
    title: 'A Man of the People',
    author: 'Chinua Achebe',
    description: 'A satirical novel set in post-independence Nigeria exploring political corruption and social issues.',
    // Project Gutenberg direct download link (if available)
    url: 'https://www.gutenberg.org/cache/epub/1242/pg1242.txt',
    format: 'txt'
  },
  {
    id: 'mine_boy',
    title: 'Mine Boy',
    author: 'Peter Abrahams',
    description: 'A classic South African novel about a young man\'s journey from rural life to the gold mines of Johannesburg.',
    url: 'https://www.gutenberg.org/cache/epub/15742/pg15742.txt',
    format: 'txt'
  }
];

// Alternative: Download from a more reliable source
const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filename);
    
    protocol.get(url, response => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        fs.unlink(filename, () => {});
        return downloadFile(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        fs.unlink(filename, () => {});
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filename);
      });
      
      file.on('error', err => {
        fs.unlink(filename, () => {});
        reject(err);
      });
    }).on('error', err => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
};

const uploadToSystem = async (filepath, title, author, description) => {
  return new Promise((resolve, reject) => {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filepath));
      form.append('title', title);
      form.append('author', author);
      form.append('description', description);
      form.append('userId', 'librarian1');

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/books',
        method: 'POST',
        headers: form.getHeaders()
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      form.pipe(req);
    } catch (err) {
      reject(err);
    }
  });
};

async function processNovels() {
  console.log('📚 Starting Novel Download and Upload Process...\n');
  console.log('⚠️  Note: Project Gutenberg URLs may have changed.');
  console.log('    Visit https://www.gutenberg.org/ to find current download links.\n');

  const tempDir = path.join(process.cwd(), 'temp_novels');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const results = {
    downloaded: [],
    uploaded: [],
    failed: []
  };

  for (const novel of novels) {
    console.log(`\n📖 Processing: ${novel.title} by ${novel.author}`);
    
    try {
      const filename = path.join(tempDir, `${novel.id}.${novel.format}`);
      
      console.log(`  📥 Downloading from: ${novel.url}`);
      
      try {
        await downloadFile(novel.url, filename);
        console.log(`  ✓ Downloaded successfully`);
        results.downloaded.push(novel.title);

        // Upload to system
        console.log(`  📤 Uploading to library system...`);
        const uploadResult = await uploadToSystem(
          filename,
          novel.title,
          novel.author,
          novel.description
        );

        console.log(`  ✓ Uploaded: ${JSON.stringify(uploadResult).substring(0, 100)}...`);
        results.uploaded.push(novel.title);

      } catch (downloadErr) {
        console.log(`  ⚠️  Download failed: ${downloadErr.message}`);
        results.failed.push({
          title: novel.title,
          reason: downloadErr.message,
          help: `Visit: https://www.gutenberg.org/ and search for "${novel.title}"`
        });
      }
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
      results.failed.push({
        title: novel.title,
        reason: err.message
      });
    }
  }

  // Cleanup
  console.log('\n\n📋 SUMMARY:');
  console.log(`✓ Downloaded: ${results.downloaded.length}`);
  console.log(`✓ Uploaded: ${results.uploaded.length}`);
  console.log(`⚠️  Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed Downloads:');
    results.failed.forEach(f => {
      console.log(`\n  ${f.title}`);
      console.log(`    Reason: ${f.reason}`);
      if (f.help) console.log(`    Help: ${f.help}`);
    });
  }

  // Save results
  fs.writeFileSync(
    path.join(process.cwd(), 'upload-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n📁 Temp files stored in: temp_novels/');
  console.log('   Run "npm run clean-temp" to remove after upload');
}

processNovels().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
