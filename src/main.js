import JSZip from "jszip";
import "./style.css";

const input = document.querySelector("#ipa-input");
const importPanel = document.querySelector("#import-panel");
const librarySection = document.querySelector("#library-section");
const resultCard = document.querySelector("#result-card");
const emptyState = document.querySelector("#empty-state");
const appGrid = document.querySelector("#app-grid");
const appCount = document.querySelector("#app-count");
const dropzone = document.querySelector("#dropzone");

const apps = [];

function openPicker() {
  input.click();
}
["hero-import", "small-import", "empty-import", "nav-import"].forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    importPanel.classList.add("visible");
    librarySection.scrollIntoView({ behavior: "smooth", block: "start" });
    openPicker();
  });
});
document.getElementById("nav-library").addEventListener("click", () => {
  importPanel.classList.remove("visible");
  librarySection.scrollIntoView({ behavior: "smooth" });
});
dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("dragover"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  const file = [...e.dataTransfer.files].find(f => f.name.toLowerCase().endsWith(".ipa"));
  if (file) inspectIPA(file);
  else showError("Selecciona un archivo con extensión .ipa.");
});
input.addEventListener("change", () => {
  const file = input.files?.[0];
  if (file) inspectIPA(file);
  input.value = "";
});

function xmlValue(xml, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<key>\\s*${escaped}\\s*</key>\\s*<(?:string|integer)>\\s*([^<]*)`, "i"));
  return match ? match[1].trim() : "";
}

async function inspectIPA(file) {
  resultCard.hidden = false;
  resultCard.innerHTML = `<div class="loading"><span class="spinner"></span><div><b>Analizando ${escapeHTML(file.name)}</b><small>Leyendo el contenido localmente…</small></div></div>`;
  try {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.keys(zip.files).filter(name => !zip.files[name].dir);
    const plistPath = entries.find(name => /^Payload\/[^/]+\.app\/Info\.plist$/i.test(name));
    let bundleName = file.name.replace(/\.ipa$/i, "");
    let version = "No disponible";
    let bundleId = "No disponible";
    let iconPath = "";
    let plistReadable = false;

    if (plistPath) {
      const plistText = await zip.file(plistPath).async("string");
      if (plistText.includes("<plist") && plistText.includes("<dict>")) {
        plistReadable = true;
        bundleName = xmlValue(plistText, "CFBundleDisplayName") || xmlValue(plistText, "CFBundleName") || bundleName;
        version = xmlValue(plistText, "CFBundleShortVersionString") || xmlValue(plistText, "CFBundleVersion") || version;
        bundleId = xmlValue(plistText, "CFBundleIdentifier") || bundleId;
        const iconEntry = entries.find(name => /^Payload\/[^/]+\.app\/(AppIcon[^/]*\.(png|jpg)|[^/]*Icon[^/]*\.png)$/i.test(name));
        if (iconEntry) iconPath = iconEntry;
      }
    }

    const payloadPresent = entries.some(name => /^Payload\/[^/]+\.app\//i.test(name));
    const signaturePresent = entries.some(name => /^Payload\/[^/]+\.app\/_CodeSignature\/CodeResources$/i.test(name));
    const record = { file, name: bundleName, version, bundleId, entries: entries.length, payloadPresent, signaturePresent, plistReadable, iconPath, zip };
    apps.unshift(record);
    renderLibrary();
    renderResult(record);
  } catch (err) {
    showError("No se ha podido leer este archivo como un paquete ZIP/IPA válido. Comprueba que la descarga esté completa.");
  }
}

function renderResult(app) {
  resultCard.hidden = false;
  resultCard.innerHTML = `
    <div class="result-top"><div><div class="eyebrow">IMPORTACIÓN COMPLETADA</div><h3>${escapeHTML(app.name)}</h3><small>${escapeHTML(app.file.name)}</small></div><span class="success-pill">Importado</span></div>
    <div class="details-grid">
      <div><small>Versión</small><b>${escapeHTML(app.version)}</b></div>
      <div><small>Identificador</small><b>${escapeHTML(app.bundleId)}</b></div>
      <div><small>Archivos leídos</small><b>${app.entries.toLocaleString("es-ES")}</b></div>
      <div><small>Estructura Payload</small><b>${app.payloadPresent ? "Detectada" : "No detectada"}</b></div>
    </div>
    <div class="notice"><b>Importante sobre la instalación</b><p>La importación solo permite consultar y descargar el archivo. La presencia de archivos de firma no demuestra que la firma sea válida ni que la app sea compatible o instalable en tu iPhone.</p></div>
    <button class="primary-btn download-btn" id="download-original">↓ Descargar IPA original</button>
  `;
  document.getElementById("download-original").addEventListener("click", () => {
    const url = URL.createObjectURL(app.file);
    const a = document.createElement("a");
    a.href = url; a.download = app.file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
}

function renderLibrary() {
  appCount.textContent = apps.length;
  emptyState.hidden = apps.length > 0;
  appGrid.innerHTML = apps.map((app, index) => `
    <article class="app-card">
      <div class="app-icon">${escapeHTML((app.name || "IPA").slice(0, 3).toUpperCase())}</div>
      <div class="app-card-info"><b>${escapeHTML(app.name)}</b><small>${escapeHTML(app.version)} · IPA</small></div>
      <button class="more-btn" data-index="${index}" aria-label="Ver detalles">···</button>
    </article>`).join("");
  appGrid.querySelectorAll(".more-btn").forEach(button => button.addEventListener("click", () => renderResult(apps[Number(button.dataset.index)])));
}

function showError(message) {
  resultCard.hidden = false;
  resultCard.innerHTML = `<div class="error-message"><b>No se pudo importar</b><p>${escapeHTML(message)}</p></div>`;
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}