import JSZip from 'jszip';
import './style.css';

const picker = document.querySelector('#ipaFile');
const result = document.querySelector('#result');
let currentFile = null;

picker.addEventListener('change', async () => {
  const file = picker.files?.[0];
  if (!file) return;
  currentFile = file;
  result.className = 'panel';
  result.innerHTML = '<p>Analizando el archivo localmente…</p>';
  try {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.keys(zip.files);
    const appPath = entries.find(p => /^Payload\/[^/]+\.app\/Info\.plist$/i.test(p));
    const appRoot = appPath ? appPath.replace(/Info\.plist$/i, '') : null;
    const plistText = appPath ? await zip.file(appPath).async('string') : '';
    const getValue = key => {
      const re = new RegExp('<key>\\s*' + key + '\\s*</key>\\s*<string>([\\s\\S]*?)</string>', 'i');
      const m = plistText.match(re);
      return m ? m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>') : '';
    };
    const name = getValue('CFBundleDisplayName') || getValue('CFBundleName') || 'Desconocido';
    const bundle = getValue('CFBundleIdentifier') || 'No leído';
    const version = getValue('CFBundleShortVersionString') || 'No leída';
    const build = getValue('CFBundleVersion') || 'No leído';
    const binaryPlist = appPath && plistText.includes('bplist');
    const hasPayload = entries.some(p => /^Payload\/[^/]+\.app\//i.test(p));
    const hasSignatureFiles = entries.some(p => /_CodeSignature\/CodeResources$/i.test(p));
    const hasProvision = entries.some(p => /embedded\.mobileprovision$/i.test(p));
    const isGta = /gta/i.test(name) || /playgta5ios/i.test(bundle);
    const plistStatus = appPath ? (binaryPlist ? 'Info.plist binario: datos no interpretados' : 'Info.plist XML encontrado') : 'No se encontró Payload/*.app/Info.plist';
    result.innerHTML = `
      <div class="eyebrow">IPA ANALIZADO</div>
      <h2>${escapeHtml(name)}</h2>
      <p>${isGta ? 'Se ha reconocido una app cuyo nombre o identificador contiene referencias a GTA.' : 'Archivo IPA leído correctamente.'}</p>
      <div class="meta">
        <div><small>Identificador</small><strong>${escapeHtml(bundle)}</strong></div>
        <div><small>Versión</small><strong>${escapeHtml(version)}</strong></div>
        <div><small>Build</small><strong>${escapeHtml(build)}</strong></div>
        <div><small>Entradas del archivo</small><strong>${entries.length}</strong></div>
      </div>
      <h3>Comprobaciones</h3>
      <div class="checks">
        <div class="check ${hasPayload?'good':'bad'}">${hasPayload?'✓':'✕'} Estructura Payload ${hasPayload?'encontrada':'no encontrada'}</div>
        <div class="check ${appPath?'good':'warn'}">${appPath?'✓':'!'} ${escapeHtml(plistStatus)}</div>
        <div class="check ${hasSignatureFiles?'warn':'bad'}">${hasSignatureFiles?'! Se encontró CodeResources (no valida la firma)':'✕ No se encontró CodeResources'}</div>
        <div class="check ${hasProvision?'warn':'warn'}">${hasProvision?'! Se encontró un perfil embedded.mobileprovision (no se ha validado)':'! No se encontró embedded.mobileprovision'}</div>
        <div class="check warn">! Compatibilidad iOS y validez criptográfica: no verificadas</div>
      </div>
      <p><b>Resultado:</b> ${binaryPlist ? 'El archivo contiene un Info.plist binario que este comprobador no interpreta.' : 'La lectura de metadatos no demuestra que el IPA pueda instalarse.'} No se puede confirmar la instalación desde el navegador.</p>
      <div class="actions">
        <button class="btn" id="download">Descargar IPA original</button>
        <button class="btn secondary" id="again">Importar otro</button>
      </div>`;
    document.querySelector('#download').addEventListener('click', () => downloadFile(file));
    document.querySelector('#again').addEventListener('click', () => picker.click());
  } catch (err) {
    result.innerHTML = `<h2>No se pudo leer el IPA</h2><p>${escapeHtml(err.message || 'Archivo ZIP/IPA no válido.')}</p>`;
  }
});

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
