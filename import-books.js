const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function importBooks() {
  try {
    const csvPath = path.join(__dirname, 'books-import.csv');
    const fileStream = fs.createReadStream(csvPath);
    
    const form = new FormData();
    form.append('file', fileStream, 'books-import.csv');
    form.append('importType', 'books');
    
    console.log('Importing books...');
    const response = await axios.post('http://localhost:3000/api/import', form, {
      headers: form.getHeaders(),
    });
    
    console.log('\n✓ Import Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✓ Books imported successfully!');
      console.log(`  - Imported: ${response.data.importedCount} book entries`);
      console.log(`  - Failed: ${response.data.failedCount}`);
    }
    
    if (response.data.errors && response.data.errors.length > 0) {
      console.log('\nErrors:');
      response.data.errors.forEach(err => console.log(`  - ${err}`));
    }
    
  } catch (error) {
    console.error('Error importing books:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

importBooks();
