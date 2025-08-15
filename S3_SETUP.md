# 🗄️ Configuración de S3 (DigitalOcean Spaces)

Esta guía explica cómo configurar el sistema de almacenamiento S3 para las funcionalidades de upload de imágenes en el Web Editor CMS.

## 📋 Requisitos Previos

1. **Cuenta de DigitalOcean** con acceso a Spaces
2. **Space creado** en DigitalOcean
3. **Access Keys** generadas para tu Space

## 🔧 Configuración Paso a Paso

### 1. Crear Space en DigitalOcean

1. Accede a tu panel de DigitalOcean
2. Ve a **Spaces Object Storage**
3. Crea un nuevo Space:
   - **Name**: `web-editor-cms` (o el nombre que prefieras)
   - **Region**: Elige la región más cercana a tus usuarios
   - **File Listing**: `Restricted` (recomendado para seguridad)

### 2. Generar Access Keys

1. En el panel de DigitalOcean, ve a **API**
2. En la sección **Spaces access keys**, haz clic en **Generate New Key**
3. Guarda tanto el **Access Key ID** como el **Secret Access Key**

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# S3 Configuration (DigitalOcean Spaces)
S3_ENDPOINT=https://REGION.digitaloceanspaces.com
S3_ACCESS_KEY_ID=tu-access-key-id
S3_SECRET_ACCESS_KEY=tu-secret-access-key
S3_BUCKET_NAME=nombre-de-tu-space
S3_REGION=region-de-tu-space

# Otras variables requeridas
JWT_SECRET=tu-clave-secreta-jwt
PORT=3000
NODE_ENV=development
```

### 4. Ejemplo de Configuración

```bash
# Ejemplo para un Space en Nueva York
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_ACCESS_KEY_ID=DO00ABCDEFGHIJKLMNOP
S3_SECRET_ACCESS_KEY=abcdefghijklmnopqrstuvwxyz1234567890ABCDEF
S3_BUCKET_NAME=mi-web-editor-cms
S3_REGION=nyc3
```

## 📁 Estructura de Archivos en S3

El sistema organizará automáticamente los archivos subidos en la siguiente estructura:

```
tu-space/
├── images/
│   └── stories/
│       ├── summary/          # Imágenes de resumen de stories
│       ├── featured/         # Imágenes destacadas
│       └── content/          # Imágenes del contenido
├── uploads/
│   ├── pages/               # Archivos de páginas
│   └── modules/             # Archivos de módulos
└── assets/
    ├── css/                # Archivos CSS personalizados
    └── js/                 # Archivos JavaScript personalizados
```

## 🔒 Configuración de Permisos

### Permisos Recomendados para el Space:

1. **File Listing**: `Restricted` 
2. **CDN**: `Enabled` (para mejor rendimiento)
3. **CORS**: Configurar si planeas uploads directos desde frontend

### Configuración CORS (si es necesaria):

```json
[
  {
    "AllowedOrigins": ["https://tu-dominio.com"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## 🚀 Verificación de la Configuración

### 1. Probar la Conexión

Una vez configuradas las variables, reinicia el servidor:

```bash
npm run dev
```

### 2. Probar Upload de Imagen

1. Accede al admin panel: `http://localhost:3000/admin`
2. Ve a **Stories** → **Add New Story**
3. En el panel lateral, busca **SUMMARY IMAGE**
4. Arrastra una imagen al dropzone
5. Verifica que se suba correctamente

### 3. Verificar en DigitalOcean

1. Ve a tu Space en el panel de DigitalOcean
2. Verifica que aparezca la imagen en: `images/stories/summary/`

## 🛠️ Solución de Problemas

### Error: "Authentication required"
- ✅ Verifica que las variables `S3_ACCESS_KEY_ID` y `S3_SECRET_ACCESS_KEY` sean correctas
- ✅ Asegúrate de que el archivo `.env` esté en la raíz del proyecto

### Error: "Access Denied"
- ✅ Verifica los permisos de las Access Keys
- ✅ Confirma que el nombre del bucket sea correcto

### Error: "Endpoint not found"
- ✅ Verifica que el `S3_ENDPOINT` tenga el formato correcto
- ✅ Confirma que la región sea la correcta

### Imágenes no se muestran
- ✅ Verifica que el Space tenga **File Listing** configurado como `Public` si quieres acceso directo
- ✅ Considera habilitar el CDN para mejor rendimiento

## 💡 Consejos Adicionales

### 1. Seguridad
- Mantén tus Access Keys seguras y no las compartas
- Usa diferentes Access Keys para desarrollo y producción
- Considera rotar las keys periódicamente

### 2. Rendimiento
- Habilita el CDN de DigitalOcean para mejor velocidad de carga
- Configura compresión de imágenes si planeas subir archivos grandes

### 3. Costos
- Monitorea el uso de almacenamiento y transferencia
- Considera configurar políticas de lifecycle para archivos antiguos

## 📞 Soporte

Si encuentras problemas:

1. Verifica la documentación de DigitalOcean Spaces
2. Revisa los logs del servidor para errores específicos
3. Consulta la documentación de AWS SDK (compatible con DigitalOcean)

## 🔄 Migración desde Otros Proveedores

El sistema usa AWS SDK, por lo que es compatible con:
- ✅ **Amazon S3**
- ✅ **DigitalOcean Spaces**
- ✅ **Linode Object Storage**
- ✅ **Wasabi**
- ✅ **MinIO**

Solo necesitas cambiar el endpoint y las credenciales en el `.env`. 