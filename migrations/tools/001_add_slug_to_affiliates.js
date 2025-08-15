/**
 * Migration: add slug to affiliates
 * Created: 2025-07-31
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the missing slug column to affiliates table
    await queryInterface.addColumn('affiliates', 'slug', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      comment: 'URL slug for the affiliate'
    });
    
    // Populate slug values for existing records
    await queryInterface.sequelize.query(`
      UPDATE affiliates 
      SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), '(', ''), ')', ''), '&', 'and'))
      WHERE slug IS NULL OR slug = ''
    `);
    
    console.log('✅ Added slug column to affiliates table');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the slug column
    await queryInterface.removeColumn('affiliates', 'slug');
    
    console.log('✅ Removed slug column from affiliates table');
  }
};
