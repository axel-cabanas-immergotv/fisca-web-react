require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function interactiveChangeCredentials() {
  try {
    console.log('🔐 Cambio Interactivo de Credenciales del Administrador');
    console.log('==================================================\n');

    // Buscar el usuario administrador
    const adminUser = await User.findOne({
      where: { email: 'admin@admin.com' }
    });

    if (!adminUser) {
      console.log('❌ No se encontró el usuario administrador');
      return;
    }

    console.log(`👤 Usuario actual: ${adminUser.email}`);
    console.log(`📝 Nombre: ${adminUser.first_name} ${adminUser.last_name}\n`);

    // Solicitar nueva información
    const newEmail = await question('📧 Nuevo email (Enter para mantener el actual): ');
    const newPassword = await question('🔑 Nueva contraseña (Enter para mantener la actual): ');
    const newFirstName = await question('👤 Nuevo nombre (Enter para mantener el actual): ');
    const newLastName = await question('👤 Nuevo apellido (Enter para mantener el actual): ');

    // Preparar datos para actualizar
    const updateData = {};
    
    if (newEmail.trim()) {
      updateData.email = newEmail.trim();
    }
    
    if (newPassword.trim()) {
      updateData.password = await bcrypt.hash(newPassword.trim(), 12);
    }
    
    if (newFirstName.trim()) {
      updateData.first_name = newFirstName.trim();
    }
    
    if (newLastName.trim()) {
      updateData.last_name = newLastName.trim();
    }

    if (Object.keys(updateData).length === 0) {
      console.log('ℹ️  No se especificaron cambios');
      return;
    }

    // Confirmar cambios
    console.log('\n📋 Resumen de cambios:');
    Object.keys(updateData).forEach(key => {
      if (key === 'password') {
        console.log(`  ${key}: [NUEVA CONTRASEÑA]`);
      } else {
        console.log(`  ${key}: ${updateData[key]}`);
      }
    });

    const confirm = await question('\n❓ ¿Confirmar cambios? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cambios cancelados');
      return;
    }

    // Actualizar usuario
    await adminUser.update(updateData);

    console.log('\n✅ Credenciales actualizadas exitosamente!');
    console.log('💡 Ahora puedes hacer login con las nuevas credenciales');

  } catch (error) {
    console.error('❌ Error al cambiar credenciales:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Ejecutar el script
interactiveChangeCredentials();
