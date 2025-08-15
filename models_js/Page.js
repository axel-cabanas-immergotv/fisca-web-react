const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Editor.js JSON content'
    },
    template: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Template identifier for different page layouts'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pages',
        key: 'id'
      }
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'System pages cannot be deleted'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    meta_title: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'SEO meta title'
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'SEO meta description'
    },
    meta_keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'SEO meta keywords'
    },
    show_in_menu: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    menu_title: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Title to show in navigation menus'
    },
    custom_css: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Custom CSS code for this page'
    }
  }, {
    tableName: 'pages',
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['status']
      },
      {
        fields: ['author_id']
      },
      {
        fields: ['parent_id']
      },
      {
        fields: ['published_at']
      }
    ],
    hooks: {
      beforeCreate: (page) => {
        if (!page.slug && page.title) {
          page.slug = page.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
        if (page.status === 'published' && !page.published_at) {
          page.published_at = new Date();
        }
      },
      beforeUpdate: (page) => {
        if (page.changed('status') && page.status === 'published' && !page.published_at) {
          page.published_at = new Date();
        }
      }
    }
  });

  // Self-referencing association for parent-child relationships
  Page.belongsTo(Page, { as: 'parent', foreignKey: 'parent_id' });
  Page.hasMany(Page, { as: 'children', foreignKey: 'parent_id' });

  // Instance methods
  Page.prototype.isPublished = function() {
    return this.status === 'published';
  };

  Page.prototype.getUrl = function() {
    return this.slug === 'home' ? '/' : `/${this.slug}`;
  };

  return Page;
}; 