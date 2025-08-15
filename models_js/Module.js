const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Module = sequelize.define('Module', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Editor.js JSON content'
    },
    type: {
      type: DataTypes.ENUM('header', 'footer', 'sidebar', 'custom'),
      allowNull: false
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Position identifier like "top", "bottom", "left", "right"'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'System modules cannot be deleted'
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON settings for module configuration'
    },
    custom_css: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Custom CSS code for this module'
    }
  }, {
    tableName: 'modules',
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['author_id']
      }
    ]
  });

  // Instance methods
  Module.prototype.isActive = function() {
    return this.status === 'active';
  };

  Module.prototype.getSettings = function() {
    try {
      return this.settings ? JSON.parse(this.settings) : {};
    } catch (e) {
      return {};
    }
  };

  Module.prototype.setSettings = function(settings) {
    this.settings = JSON.stringify(settings);
  };

  return Module;
}; 