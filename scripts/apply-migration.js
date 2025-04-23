const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20240423_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Migration SQL Script');
    console.log('Please copy and run this SQL in the Supabase SQL Editor.');
    console.log('\n----- SQL TO EXECUTE -----\n');
    console.log(migrationSQL);
    console.log('\n----- END OF SQL -----\n');

    console.log('Instructions:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Paste the SQL above');
    console.log('4. Click "Run" to execute the migration');
    console.log('\nNote: Direct execution from this script is not supported. Please run the SQL manually.');
  } catch (error) {
    console.error('Error reading migration file:', error.message);
    process.exit(1);
  }
}

applyMigration();
