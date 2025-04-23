const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  try {
    // Read the seed file
    const seedPath = path.join(__dirname, '../supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('Seed SQL Script');
    console.log('Please copy and run this SQL in the Supabase SQL Editor.');
    console.log('\n----- SQL TO EXECUTE -----\n');
    console.log(seedSQL);
    console.log('\n----- END OF SQL -----\n');

    console.log('Instructions:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Paste the SQL above');
    console.log('4. Click "Run" to execute the seed data');
    console.log('\nNote: Direct execution from this script is not supported. Please run the SQL manually.');
  } catch (error) {
    console.error('Error reading seed file:', error.message);
    process.exit(1);
  }
}

seedDatabase();
