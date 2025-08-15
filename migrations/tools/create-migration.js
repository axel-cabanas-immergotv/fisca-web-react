#!/usr/bin/env node

/**
 * Migration Generator Script
 * Helps create new migration files with proper naming and structure
 * 
 * Usage: node migrations/create-migration.js "add_field_to_table"
 */

const fs = require('fs');
const path = require('path');

// Get migration name from command line
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Please provide a migration name');
  console.log('Usage: node migrations/create-migration.js "add_field_to_table"');
  process.exit(1);
}

// Clean migration name (remove spaces, special chars)
const cleanName = migrationName
  .toLowerCase()
  .replace(/[^a-z0-9_]/g, '_')
  .replace(/_+/g, '_')
  .replace(/^_|_$/g, '');

// Get next migration number
function getNextMigrationNumber() {
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^\d{3}_.*\.js$/))
    .sort();
  
  if (files.length === 0) {
    return '001';
  }
  
  const lastFile = files[files.length - 1];
  const lastNumber = parseInt(lastFile.substring(0, 3));
  const nextNumber = lastNumber + 1;
  
  return nextNumber.toString().padStart(3, '0');
}

// Create migration file content
function createMigrationContent(name) {
  const today = new Date().toISOString().split('T')[0];
  
  return `/**
 * Migration: ${name.replace(/_/g, ' ')}
 * Created: ${today}
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // TODO: Add your migration logic here
    // Examples:
    // 
    // Add column:
    // await queryInterface.addColumn('table_name', 'column_name', {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // });
    //
    // Create table:
    // await queryInterface.createTable('table_name', {
    //   id: {
    //     type: Sequelize.INTEGER,
    //     primaryKey: true,
    //     autoIncrement: true
    //   },
    //   created_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false,
    //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    //   },
    //   updated_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false,
    //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    //   }
    // });
    
    console.log('✅ TODO: Add success message');
  },

  down: async (queryInterface, Sequelize) => {
    // TODO: Add your rollback logic here
    // This should reverse what was done in the up() method
    //
    // Remove column:
    // await queryInterface.removeColumn('table_name', 'column_name');
    //
    // Drop table:
    // await queryInterface.dropTable('table_name');
    
    console.log('✅ TODO: Add rollback success message');
  }
};
`;
}

// Generate filename and create file
try {
  const migrationNumber = getNextMigrationNumber();
  const filename = `${migrationNumber}_${cleanName}.js`;
  const filepath = path.join(__dirname, filename);
  
  // Check if file already exists
  if (fs.existsSync(filepath)) {
    console.error(`❌ Migration file already exists: ${filename}`);
    process.exit(1);
  }
  
  // Create migration file
  const content = createMigrationContent(cleanName);
  fs.writeFileSync(filepath, content);
  
  console.log(`✅ Created migration: ${filename}`);
  console.log(`📝 Edit the file to add your migration logic`);
  console.log(`🚀 Run with: npm run migrate`);
  
} catch (error) {
  console.error('❌ Error creating migration:', error.message);
  process.exit(1);
} 