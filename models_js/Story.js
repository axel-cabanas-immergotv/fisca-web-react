const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Story = sequelize.define('Story', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Editor.js JSON content'
    },
    featured_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    summary_image: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to summary image stored in S3'
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    views_count: {
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
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comma-separated tags'
    }
  }, {
    tableName: 'stories',
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['status']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['author_id']
      },
      {
        fields: ['published_at']
      }
    ],
    hooks: {
      beforeCreate: (story) => {
        if (!story.slug && story.title) {
          story.slug = story.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
        if (story.status === 'published' && !story.published_at) {
          story.published_at = new Date();
        }
      },
      beforeUpdate: (story) => {
        if (story.changed('status') && story.status === 'published' && !story.published_at) {
          story.published_at = new Date();
        }
      }
    }
  });

  // Instance methods
  Story.prototype.isPublished = function() {
    return this.status === 'published';
  };

  Story.prototype.getUrl = function() {
    return `/story/${this.slug}`;
  };

  return Story;
}; 