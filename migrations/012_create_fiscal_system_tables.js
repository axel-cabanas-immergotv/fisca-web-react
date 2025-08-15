'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create localidades table
    await queryInterface.createTable('localidades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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

    // Create secciones table
    await queryInterface.createTable('secciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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

    // Create circuitos table
    await queryInterface.createTable('circuitos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      localidad_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'localidades',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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

    // Create escuelas table
    await queryInterface.createTable('escuelas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      circuito_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'circuitos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      calle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      altura: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      lon: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      dificultad: {
        type: Sequelize.STRING,
        allowNull: true
      },
      abierto: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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

    // Create mesas table
    await queryInterface.createTable('mesas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      escuela_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'escuelas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      mesa_testigo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mesa_extranjeros: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      mesa_abrio: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      acta_de_escrutinio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      certificado_de_escrutinio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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

    // Create ciudadanos table
    await queryInterface.createTable('ciudadanos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mesa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mesas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dni: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true
      },
      nacionalidad: {
        type: Sequelize.STRING,
        allowNull: true
      },
      genero: {
        type: Sequelize.ENUM('masculino', 'femenino', 'otro'),
        allowNull: true
      },
      domicilio: {
        type: Sequelize.STRING,
        allowNull: true
      },
      codigo_postal: {
        type: Sequelize.STRING,
        allowNull: true
      },
      numero_orden: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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

    // Create users_access table
    await queryInterface.createTable('users_access', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      localidad_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'localidades',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      circuito_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'circuitos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      escuela_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'escuelas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mesa_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'mesas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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
    await queryInterface.addIndex('localidades', ['nombre']);
    await queryInterface.addIndex('localidades', ['status']);
    
    await queryInterface.addIndex('secciones', ['numero']);
    await queryInterface.addIndex('secciones', ['status']);
    
    await queryInterface.addIndex('circuitos', ['localidad_id']);
    await queryInterface.addIndex('circuitos', ['nombre']);
    await queryInterface.addIndex('circuitos', ['status']);
    
    await queryInterface.addIndex('escuelas', ['circuito_id']);
    await queryInterface.addIndex('escuelas', ['nombre']);
    await queryInterface.addIndex('escuelas', ['abierto']);
    await queryInterface.addIndex('escuelas', ['status']);
    
    await queryInterface.addIndex('mesas', ['escuela_id']);
    await queryInterface.addIndex('mesas', ['numero']);
    await queryInterface.addIndex('mesas', ['mesa_testigo']);
    await queryInterface.addIndex('mesas', ['mesa_extranjeros']);
    await queryInterface.addIndex('mesas', ['mesa_abrio']);
    await queryInterface.addIndex('mesas', ['status']);
    await queryInterface.addIndex('mesas', ['escuela_id', 'numero'], {
      unique: true,
      name: 'unique_mesa_per_escuela'
    });
    
    await queryInterface.addIndex('ciudadanos', ['mesa_id']);
    await queryInterface.addIndex('ciudadanos', ['dni'], { unique: true });
    await queryInterface.addIndex('ciudadanos', ['apellido', 'nombre']);
    await queryInterface.addIndex('ciudadanos', ['numero_orden']);
    await queryInterface.addIndex('ciudadanos', ['genero']);
    await queryInterface.addIndex('ciudadanos', ['nacionalidad']);
    await queryInterface.addIndex('ciudadanos', ['status']);
    
    await queryInterface.addIndex('users_access', ['user_id']);
    await queryInterface.addIndex('users_access', ['localidad_id']);
    await queryInterface.addIndex('users_access', ['circuito_id']);
    await queryInterface.addIndex('users_access', ['escuela_id']);
    await queryInterface.addIndex('users_access', ['mesa_id']);
    await queryInterface.addIndex('users_access', ['user_id', 'localidad_id', 'circuito_id', 'escuela_id', 'mesa_id'], {
      unique: true,
      name: 'unique_user_access'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users_access');
    await queryInterface.dropTable('ciudadanos');
    await queryInterface.dropTable('mesas');
    await queryInterface.dropTable('escuelas');
    await queryInterface.dropTable('circuitos');
    await queryInterface.dropTable('secciones');
    await queryInterface.dropTable('localidades');
  }
};
