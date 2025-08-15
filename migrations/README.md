# 🔄 Sistema de Migrations

Este directorio contiene las migraciones de base de datos para el Web Editor CMS.

## ✨ Características

- **Simple y efectivo**: Sistema de migrations sin dependencias externas
- **Tracking automático**: Rastrea qué migrations se han ejecutado
- **Rollback**: Permite revertir migrations
- **Orden garantizado**: Las migrations se ejecutan en orden alfabético
- **Compatible con PostgreSQL**: Optimizado para el motor de base de datos del proyecto

## 📋 Comandos Disponibles

```bash
# Ejecutar todas las migrations pendientes
npm run migrate

# Revertir la última migration
npm run migrate:rollback
```

## 📝 Crear una Nueva Migration

1. **Nombrar el archivo**: Usa el formato `XXX_descripcion_de_la_migration.js`
   - `XXX`: Número secuencial (001, 002, 003, etc.)
   - `descripcion`: Descripción breve de la migration

2. **Estructura del archivo**:
```javascript
/**
 * Migration: Descripción de qué hace esta migration
 * Created: YYYY-MM-DD
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cambios para aplicar (agregar tablas, columnas, etc.)
    await queryInterface.addColumn('tabla', 'nueva_columna', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    console.log('✅ Descripción de lo que se hizo');
  },

  down: async (queryInterface, Sequelize) => {
    // Cambios para revertir
    await queryInterface.removeColumn('tabla', 'nueva_columna');
    
    console.log('✅ Descripción de lo que se revirtió');
  }
};
```

## 🛠️ Operaciones Comunes

### Agregar Columna
```javascript
await queryInterface.addColumn('tabla', 'columna', {
  type: Sequelize.STRING,
  allowNull: true,
  defaultValue: null
});
```

### Eliminar Columna
```javascript
await queryInterface.removeColumn('tabla', 'columna');
```

### Crear Tabla
```javascript
await queryInterface.createTable('nueva_tabla', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});
```

### Eliminar Tabla
```javascript
await queryInterface.dropTable('tabla');
```

### Agregar Índice
```javascript
await queryInterface.addIndex('tabla', ['columna1', 'columna2'], {
  name: 'idx_tabla_columnas'
});
```

## 📊 Estado de Migrations

El sistema mantiene una tabla `migrations` que rastrea:
- `filename`: Nombre del archivo de migration
- `executed_at`: Cuándo se ejecutó la migration

## ⚠️ Mejores Prácticas

1. **Siempre incluir rollback**: Cada migration debe tener su `down` method
2. **Probar antes de desplegar**: Ejecuta y revierte la migration en desarrollo
3. **No modificar migrations ejecutadas**: Crea una nueva migration en su lugar
4. **Usar nombres descriptivos**: El nombre debe explicar qué hace la migration
5. **Verificar dependencias**: Asegúrate de que las migrations se ejecuten en orden

## 🚀 Migrations Aplicadas

### 001_add_summary_image_to_stories.js
- **Fecha**: 2024-01-20
- **Descripción**: Agrega el campo `summary_image` a la tabla `stories`
- **Propósito**: Permite almacenar URLs de imágenes de resumen para las stories

## 🔧 Solución de Problemas

### Error: "no such column"
Esto indica que falta ejecutar una migration. Ejecuta:
```bash
npm run migrate
```

### Rollback de Migration
Si necesitas revertir la última migration:
```bash
npm run migrate:rollback
```

### Estado de Migrations
Para ver qué migrations se han ejecutado, consulta la tabla `migrations` en la base de datos. 