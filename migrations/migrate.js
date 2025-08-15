require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

/**
 * Simple Migration Runner
 * Keeps track of executed migrations and runs pending ones
 */

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await sequelize.query(createTableQuery);
}

// Get list of executed migrations
async function getExecutedMigrations() {
  const [results] = await sequelize.query('SELECT filename FROM migrations ORDER BY executed_at');
  return results.map(row => row.filename);
}

// Mark migration as executed
async function markMigrationExecuted(filename) {
  await sequelize.query('INSERT INTO migrations (filename) VALUES (?)', {
    replacements: [filename]
  });
}

// Get all migration files
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js') && file !== 'migrate.js')
    .sort(); // Ensure they run in order
  
  return files;
}

// Run a single migration
async function runMigration(filename, direction = 'up') {
  const migrationPath = path.join(__dirname, filename);
  const migration = require(migrationPath);
  
  if (typeof migration[direction] !== 'function') {
    throw new Error(`Migration ${filename} does not have a ${direction} method`);
  }
  
  console.log(`Running migration: ${filename} (${direction})`);
  await migration[direction](sequelize.getQueryInterface(), sequelize.constructor);
  
  if (direction === 'up') {
    await markMigrationExecuted(filename);
  } else if (direction === 'down') {
    await sequelize.query('DELETE FROM migrations WHERE filename = ?', {
      replacements: [filename]
    });
  }
}

// Main migration runner
async function runMigrations() {
  try {
    console.log('🔄 Starting migrations...');
    
    // Ensure migrations table exists
    await createMigrationsTable();
    
    // Get migration files and executed migrations
    const allMigrations = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    // Find pending migrations
    const pendingMigrations = allMigrations.filter(file => !executedMigrations.includes(file));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(file => console.log(`  - ${file}`));
    
    // Run pending migrations
    for (const migration of pendingMigrations) {
      await runMigration(migration, 'up');
    }
    
    console.log('✅ All migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Rollback last migration
async function rollbackMigration() {
  try {
    console.log('🔄 Rolling back last migration...');
    
    await createMigrationsTable();
    
    // Get last executed migration
    const [results] = await sequelize.query(
      'SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1'
    );
    
    if (results.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }
    
    const lastMigration = results[0].filename;
    await runMigration(lastMigration, 'down');
    
    console.log('✅ Rollback completed successfully');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rollback') {
    rollbackMigration().finally(() => process.exit(0));
  } else {
    runMigrations().finally(() => process.exit(0));
  }
}

module.exports = {
  runMigrations,
  rollbackMigration
}; 