const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Generate SQL from Prisma schema
console.log('Generating SQL from Prisma schema...');
try {
  execSync('npx prisma migrate dev --name init --create-only', { stdio: 'inherit' });
  
  // Read the generated SQL file
  const migrationDir = path.join(__dirname, '../prisma/migrations');
  const latestMigration = fs.readdirSync(migrationDir)
    .filter(dir => dir.match(/^\d{14}_init$/))
    .sort()
    .pop();
  
  if (!latestMigration) {
    throw new Error('Migration file not found');
  }
  
  const sqlPath = path.join(migrationDir, latestMigration, 'migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Save the SQL to a file in the supabase directory
  const supabaseSqlPath = path.join(__dirname, '../supabase/prisma-schema.sql');
  fs.writeFileSync(supabaseSqlPath, sql);
  
  console.log(`SQL schema generated and saved to ${supabaseSqlPath}`);
  console.log('You can now run this SQL in your Supabase project');
} catch (error) {
  console.error('Error generating schema:', error);
  process.exit(1);
}
