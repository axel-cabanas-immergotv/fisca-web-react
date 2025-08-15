// Load environment variables
require('dotenv').config();

const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration based on environment
function getDatabaseConfig() {
  const dbType = process.env.DATABASE || 'sqlite';
  
  if (dbType === 'postgres') {
    return {
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    };
  } else {
    // Default to SQLite
    return {
      dialect: 'sqlite',
      storage: process.env.SQLITE_STORAGE || path.join(__dirname, '..', 'database.sqlite'),
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    };
  }
}

const sequelize = new Sequelize(getDatabaseConfig());

// Import models
const User = require('./User')(sequelize);
const Role = require('./Role')(sequelize);
const Permission = require('./Permission')(sequelize);
const Page = require('./Page')(sequelize);
const Story = require('./Story')(sequelize);
const Category = require('./Category')(sequelize);
const Module = require('./Module')(sequelize);
const File = require('./File')(sequelize);
const Menu = require('./Menu')(sequelize);
const Affiliate = require('./Affiliate')(sequelize);
const Localidad = require('./Localidad')(sequelize);
const Seccion = require('./Seccion')(sequelize);
const Circuito = require('./Circuito')(sequelize);
const Escuela = require('./Escuela')(sequelize);
const Mesa = require('./Mesa')(sequelize);
const Ciudadano = require('./Ciudadano')(sequelize);
const UserAccess = require('./UserAccess')(sequelize);
const UserAffiliate = require('./UserAffiliate')(sequelize);
const AffiliateMember = require('./AffiliateMember')(sequelize);

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// Hierarchical associations for pyramidal structure
User.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(User, { foreignKey: 'created_by', as: 'createdUsers' });

Role.belongsToMany(Permission, { 
  through: 'role_permissions', 
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permission.belongsToMany(Role, { 
  through: 'role_permissions', 
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

Story.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Story, { foreignKey: 'author_id', as: 'stories' });

Story.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Story, { foreignKey: 'category_id', as: 'stories' });

Page.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Page, { foreignKey: 'author_id', as: 'pages' });

Module.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Module, { foreignKey: 'author_id', as: 'modules' });

File.belongsTo(User, { foreignKey: 'user_id', as: 'uploader' });
User.hasMany(File, { foreignKey: 'user_id', as: 'uploaded_files' });

Menu.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Menu, { foreignKey: 'category_id', as: 'menus' });

// Fiscal Pro entities relationships
Circuito.belongsTo(Localidad, { foreignKey: 'localidad_id', as: 'localidad' });
Localidad.hasMany(Circuito, { foreignKey: 'localidad_id', as: 'circuitos' });

Escuela.belongsTo(Circuito, { foreignKey: 'circuito_id', as: 'circuito' });
Circuito.hasMany(Escuela, { foreignKey: 'circuito_id', as: 'escuelas' });

Mesa.belongsTo(Escuela, { foreignKey: 'escuela_id', as: 'escuela' });
Escuela.hasMany(Mesa, { foreignKey: 'escuela_id', as: 'mesas' });

Ciudadano.belongsTo(Mesa, { foreignKey: 'mesa_id', as: 'mesa' });
Mesa.hasMany(Ciudadano, { foreignKey: 'mesa_id', as: 'ciudadanos' });

// UserAccess associations
User.hasMany(UserAccess, { foreignKey: 'user_id', as: 'access_assignments' });
UserAccess.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserAccess.belongsTo(Localidad, { foreignKey: 'localidad_id', as: 'localidad' });
Localidad.hasMany(UserAccess, { foreignKey: 'localidad_id', as: 'user_assignments' });

UserAccess.belongsTo(Circuito, { foreignKey: 'circuito_id', as: 'circuito' });
Circuito.hasMany(UserAccess, { foreignKey: 'circuito_id', as: 'user_assignments' });

UserAccess.belongsTo(Escuela, { foreignKey: 'escuela_id', as: 'escuela' });
Escuela.hasMany(UserAccess, { foreignKey: 'escuela_id', as: 'user_assignments' });

UserAccess.belongsTo(Mesa, { foreignKey: 'mesa_id', as: 'mesa' });
Mesa.hasMany(UserAccess, { foreignKey: 'mesa_id', as: 'user_assignments' });

// UserAffiliate associations
User.belongsToMany(Affiliate, { 
  through: UserAffiliate, 
  foreignKey: 'user_id',
  otherKey: 'affiliate_id',
  as: 'affiliates'
});
Affiliate.belongsToMany(User, { 
  through: UserAffiliate, 
  foreignKey: 'affiliate_id',
  otherKey: 'user_id',
  as: 'users'
});

// Call associate functions for junction table models
UserAffiliate.associate({ User, Affiliate });
AffiliateMember.associate({ Affiliate });

// AffiliateMember associations (for affiliate-to-affiliate relationships)
Affiliate.belongsToMany(Affiliate, { 
  through: AffiliateMember, 
  foreignKey: 'from_affiliate_id',
  otherKey: 'to_affiliate_id',
  as: 'members'
});
Affiliate.belongsToMany(Affiliate, { 
  through: AffiliateMember, 
  foreignKey: 'to_affiliate_id',
  otherKey: 'from_affiliate_id',
  as: 'parent_affiliates'
});

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  Page,
  Story,
  Category,
  Module,
  File,
  Menu,
  Affiliate,
  Localidad,
  Seccion,
  Circuito,
  Escuela,
  Mesa,
  Ciudadano,
  UserAccess,
  UserAffiliate,
  AffiliateMember
}; 