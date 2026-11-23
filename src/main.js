import JSZip from 'jszip';
import plist from 'plist';

const $ = (s) => document.querySelector(s);
const state = { files: [] };
const input = $('#fileInput');
const result = $('#result');

function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('hidden', v.id !== view));
  document.querySelectorAll('.nav').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $('#page-title').textContent = ({dashboard:'Panel principal',analyzer:'Analizador',library:'Mi biblioteca'})[view];
}
document.querySelectorAll('.nav').forEach(b => b.addEventListener('click',()=>navigate(b.dataset.view)));
$('#heroUpload').onclick = () => { navigate('analyzer'); input.click(); };
$('#toolIpa').onclick = () => { navigate('analyzer'); input.click(); };
$('#toolApk').onclick = () => { navigate('analyzer'); input.click(); };
$('#toolLibrary').onclick = () => navigate('library');
$('#libraryUpload').onclick = () => { navigate('analyzer'); input.click(); };
$('#themeBtn').onclick = () => document.body.classList.toggle('light');
$('#dropzone').onclick = (e) => { if(e.target !== input) input.click(); };
$('#dropzone').addEventListener('dragover',e=>{e.preventDefault();$('#dropzone').style.borderColor='#a99aff';});
$('#dropzone').addEventListener('dragleave',()=>$('#dropzone').style.borderColor='');
$('#dropzone').addEventListener('drop',e=>{e.preventDefault();$('#dropzone').style.borderColor='';const f=e.dataTransfer.files[0];if(f) inspect(f);});
input.addEventListener('change',()=>{if(input.files[0]) inspect(input.files[0]);input.value='';});

function esc(v){return String(v??'No disponible').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function size(n){if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(2)+' MB';}
async function inspect(file){
  const ext=file.name.split('.').pop().toLowerCase();
  if(!['ipa','apk','zip'].includes(ext)){alert('Formato no admitido. Selecciona un archivo IPA o APK.');return;}
  result.classList.remove('hidden');result.innerHTML='<p>Analizando el contenido localmente…</p>';
  try{
    const zip=await JSZip.loadAsync(file);
    const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir);
    let metadata={};
    if(ext==='ipa'){
      const plistName=names.find(n=>/^Payload\/[^/]+\.app\/Info\.plist$/i.test(n));
      if(plistName){
        const raw=await zip.files[plistName].async('uint8array');
        const text=new TextDecoder().decode(raw);
        if(text.trim().startsWith('<?xml')||text.trim().startsWith('<!DOCTYPE')||text.trim().startsWith('<plist')) {
          const p=plist.parse(text);
          metadata={'Nombre visible':p.CFBundleDisplayName||p.CFBundleName,'Identificador':p.CFBundleIdentifier,'Versión':p.CFBundleShortVersionString,'Build':p.CFBundleVersion,'Versión mínima iOS':p.MinimumOSVersion};
        } else metadata['Info.plist']='Encontrado en formato binario; lectura no disponible en esta versión.';
      } else metadata['Info.plist']='No encontrado en la ruta habitual.';
    } else if(ext==='apk'){
      metadata['Tipo']='Paquete Android (APK)';
      metadata['Manifest']='AndroidManifest.xml encontrado: '+names.some(n=>n==='AndroidManifest.xml');
      metadata['Nota']='El manifiesto Android suele estar en formato binario; esta versión no extrae aún nombre, versión ni permisos.';
    }
    const entry={name:file.name,ext,size:file.size,items:names.length,metadata};
    state.files.unshift(entry);$('#count').textContent=state.files.length;renderLibrary();
    const rows=Object.entries(metadata).map(([k,v])=>`<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('');
    const listing=names.slice(0,100).map(n=>`<div class="file-row">${esc(n)}</div>`).join('');
    result.innerHTML=`<h3>✓ Análisis completado</h3><div class="meta"><div><small>ARCHIVO</small><b>${esc(file.name)}</b></div><div><small>FORMATO</small><b>${ext.toUpperCase()}</b></div><div><small>TAMAÑO</small><b>${size(file.size)}</b></div><div><small>ELEMENTOS</small><b>${names.length}</b></div>${rows}</div><div class="file-list"><b>Contenido del paquete (máximo 100 elementos mostrados)</b>${listing}</div><div class="notice"><b>Resultado informativo, no certificado de seguridad</b><p>Este análisis solo inspecciona la estructura ZIP y metadatos disponibles. No verifica la firma, no detecta todo el malware y no confirma compatibilidad ni posibilidad de instalación.</p></div>`;
  }catch(err){result.innerHTML='<h3>No se pudo leer el paquete</h3><p class="muted">El archivo puede estar dañado, cifrado o no ser un ZIP válido.</p>';}
}
function renderLibrary(){
 const el=$('#libraryList');
 if(!state.files.length){el.className='empty';el.textContent='Todavía no has importado ningún paquete.';return;}
 el.className='';
 el.innerHTML=state.files.map(f=>`<div class="result" style="margin:10px 0"><b>${esc(f.name)}</b><p class="muted">${f.ext.toUpperCase()} · ${size(f.size)} · ${f.items} elementos</p></div>`).join('');
}
