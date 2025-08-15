const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    links: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON with list of menu items',
      get() {
        const value = this.getDataValue('links');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('links', JSON.stringify(value || []));
      }
    },
    platform: {
      type: DataTypes.ENUM('Web', 'Android', 'iOS'),
      allowNull: false,
      defaultValue: 'Web'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Main URL link for the menu'
    },
    feed_layout_type: {
      type: DataTypes.ENUM('List View', 'HeroCarousel', 'CategoryBlock', 'VideoBlock'),
      allowNull: true,
      comment: 'Layout type for feed display'
    },
    feed_video_type: {
      type: DataTypes.ENUM('Stream Video', 'Live Stream Video'),
      allowNull: true,
      comment: 'Video type for video feeds'
    },
    feed_video_link: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL for feed video content'
    },
    feed_placeholder_image: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL for placeholder image'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Order for menu display'
    }
  }, {
    tableName: 'menus',
    indexes: [
      {
        fields: ['platform']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sort_order']
      }
    ]
  });

  // Instance methods
  Menu.prototype.isActive = function() {
    return this.status === 'active';
  };

  Menu.prototype.getLinksCount = function() {
    return this.links ? this.links.length : 0;
  };

  return Menu;
}; 