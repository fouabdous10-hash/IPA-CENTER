# IPA CENTER

IPA CENTER es una interfaz web para importar y consultar archivos IPA localmente.

## Desarrollo
1. Instala Node.js LTS.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev`.

## Publicación en Render
- Tipo: Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Root Directory: vacío

## Importación
El archivo se procesa en el navegador con JSZip. No se envía a un servidor.
La app puede mostrar metadatos simples del Info.plist cuando está en formato XML.
Los Info.plist binarios no se decodifican en esta versión.

## Límites importantes
Importar o descargar un IPA no lo instala en iOS. Esta herramienta no firma aplicaciones, no valida certificados criptográficos, no elude las protecciones de Apple y no garantiza compatibilidad. La instalación requiere un método autorizado y una firma válida.
