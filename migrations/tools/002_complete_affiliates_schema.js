/**
 * Migration: complete affiliates schema
 * Created: 2025-07-31
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to match the Affiliate model
    
    // Add description column
    await queryInterface.addColumn('affiliates', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Description of the affiliate'
    });
    
    // Add domain column
    await queryInterface.addColumn('affiliates', 'domain', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Domain associated with this affiliate'
    });
    
    // Add logo_url column
    await queryInterface.addColumn('affiliates', 'logo_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL to affiliate logo'
    });
    
    // Rename 'color' to 'primary_color' if it exists
    try {
      await queryInterface.renameColumn('affiliates', 'color', 'primary_color');
    } catch (error) {
      // If renaming fails, add primary_color column
      await queryInterface.addColumn('affiliates', 'primary_color', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Primary hex color code for affiliate branding'
      });
    }
    
    // Add secondary_color column
    await queryInterface.addColumn('affiliates', 'secondary_color', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Secondary hex color code for affiliate branding'
    });
    
    // Add settings column
    await queryInterface.addColumn('affiliates', 'settings', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'JSON settings for affiliate configuration'
    });
    
    // Add sort_order column
    await queryInterface.addColumn('affiliates', 'sort_order', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Sort order for displaying affiliates'
    });
    
    // Add index for sort_order
    await queryInterface.addIndex('affiliates', ['sort_order'], {
      name: 'affiliates_sort_order_index'
    });
    
    console.log('✅ Completed affiliates schema to match model');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added columns
    await queryInterface.removeColumn('affiliates', 'description');
    await queryInterface.removeColumn('affiliates', 'domain');
    await queryInterface.removeColumn('affiliates', 'logo_url');
    await queryInterface.removeColumn('affiliates', 'secondary_color');
    await queryInterface.removeColumn('affiliates', 'settings');
    await queryInterface.removeColumn('affiliates', 'sort_order');
    
    // Rename primary_color back to color if needed
    try {
      await queryInterface.renameColumn('affiliates', 'primary_color', 'color');
    } catch (error) {
      // Ignore if column doesn't exist
    }
    
    console.log('✅ Reverted affiliates schema changes');
  }
};
