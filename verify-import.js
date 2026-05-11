const axios = require('axios');

async function verifyImport() {
  try {
    console.log('Verifying imported books...\n');
    
    // Get imported books from the import endpoint
    const response = await axios.get('http://localhost:3000/api/import');
    
    console.log(`✓ Books source: ${response.data.source}`);
    console.log(`✓ Total book entries: ${response.data.count}`);
    
    if (response.data.books && response.data.books.length > 0) {
      console.log('\n📚 Sample of imported books:');
      response.data.books.slice(0, 10).forEach((book, index) => {
        console.log(`\n${index + 1}. ${book.title}`);
        console.log(`   Author: ${book.author}`);
        console.log(`   ISBN: ${book.isbn}`);
        console.log(`   Category: ${book.category}`);
        console.log(`   Quantity: ${book.quantity}`);
      });
      
      // Show statistics by category
      const categories = {};
      response.data.books.forEach(book => {
        if (!categories[book.category]) {
          categories[book.category] = { count: 0, totalQty: 0 };
        }
        categories[book.category].count++;
        categories[book.category].totalQty += book.quantity;
      });
      
      console.log('\n📊 Books by Category:');
      const sortedCats = Object.entries(categories).sort((a, b) => 
        b[1].totalQty - a[1].totalQty
      );
      
      sortedCats.forEach(([cat, data]) => {
        console.log(`  - ${cat}: ${data.count} entries, ${data.totalQty} books total`);
      });
      
      const totalQty = Object.values(categories).reduce((sum, cat) => sum + cat.totalQty, 0);
      const totalEntries = response.data.books.length;
      
      console.log(`\n✅ Summary:`);
      console.log(`   Total book entries: ${totalEntries}`);
      console.log(`   Total books in inventory: ${totalQty}`);
    }
    
  } catch (error) {
    console.error('Error verifying import:', error.message);
  }
}

verifyImport();
