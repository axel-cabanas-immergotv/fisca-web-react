'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create user_affiliates table
    await queryInterface.createTable('user_affiliates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      affiliate_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'affiliates',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create affiliate_members table
    await queryInterface.createTable('affiliate_members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from_affiliate_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'affiliates',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      to_affiliate_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'affiliates',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      can_use: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_copy: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      can_assign: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      access_publishers: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('user_affiliates', ['user_id', 'affiliate_id'], { unique: true });
    await queryInterface.addIndex('user_affiliates', ['user_id']);
    await queryInterface.addIndex('user_affiliates', ['affiliate_id']);
    
    await queryInterface.addIndex('affiliate_members', ['from_affiliate_id', 'to_affiliate_id'], { 
      unique: true,
      name: 'affiliate_members_unique_relationship'
    });
    await queryInterface.addIndex('affiliate_members', ['from_affiliate_id']);
    await queryInterface.addIndex('affiliate_members', ['to_affiliate_id']);
    await queryInterface.addIndex('affiliate_members', ['can_use']);
    await queryInterface.addIndex('affiliate_members', ['can_copy']);
    await queryInterface.addIndex('affiliate_members', ['can_assign']);
    await queryInterface.addIndex('affiliate_members', ['access_publishers']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('affiliate_members');
    await queryInterface.dropTable('user_affiliates');
  }
};
