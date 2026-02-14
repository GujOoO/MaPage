// Map initialization with single base layer (OSM)
const defaultCenter = [41.9028, 12.4964]; // Roma
const defaultZoom = 13;

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
});

const map = L.map('map', {
  center: defaultCenter,
  zoom: defaultZoom,
  layers: [osm],
});

/* // Geocoder
L.Control.geocoder({
  defaultMarkGeocode: false,
})
  .on('markgeocode', (e) => {
    const marker = L.marker(e.geocode.center, {
      icon: L.icon({
        iconUrl: browser.runtime.getURL('icon/marker-icon.png'),
        iconSize: [30, 30],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
    }).addTo(map);

    map.fitBounds(e.geocode.bbox);
  })
  .addTo(map); */

// DOM elements
const fileInput = document.getElementById('fileInput');
const fileInputPlaceholder = document.getElementById('fileInputPlaceholder');
const browseBtn = document.getElementById('browseBtn');
const layerList = document.getElementById('layerList');
const panel = document.getElementById('control-panel');
const panelHeader = document.getElementById('panel-header');

// State: multiple GeoJSON layers
let layerIdCounter = 0;
const geoJsonLayers = new Map(); // id -> { layerGroup, name, data }

// --- Styling by geometry type ---
function getFeatureStyle(feature) {
  const type = feature.geometry && feature.geometry.type;
  switch (type) {
    case 'Point':
    case 'MultiPoint':
      return {
        radius: 6,
        color: '#0066cc',
        fillColor: '#3399ff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      };
    case 'LineString':
    case 'MultiLineString':
      return {
        color: '#ff8800',
        weight: 3,
        opacity: 0.9,
      };
    case 'Polygon':
    case 'MultiPolygon':
      return {
        color: '#008000',
        weight: 2,
        opacity: 0.8,
        fillColor: '#00b300',
        fillOpacity: 0.3,
      };
    default:
      return {
        color: '#444',
        weight: 2,
        opacity: 0.8,
        fillColor: '#888',
        fillOpacity: 0.2,
      };
  }
}

function onEachFeature(feature, layer) {
  // Popup con le proprietà
  if (feature.properties) {
    const entries = Object.entries(feature.properties)
      .map(([k, v]) => `<strong>${k}</strong>: ${v}`)
      .join('<br />');
    if (entries) {
      layer.bindPopup(entries);
    }
  }

  // Hover highlight
  layer.on({
    mouseover: (e) => {
      const target = e.target;
      if (target.setStyle) {
        target.setStyle({ weight: 4, opacity: 1 });
      }
      const el = target.getElement && target.getElement();
      if (el) el.classList.add('hovered');
    },
    mouseout: (e) => {
      const target = e.target;
      if (target.setStyle) {
        const style = getFeatureStyle(feature);
        target.setStyle(style);
      }
      const el = target.getElement && target.getElement();
      if (el) el.classList.remove('hovered');
    },
  });
}

function pointToLayer(feature, latlng) {
  const style = getFeatureStyle(feature);
  return L.circleMarker(latlng, style);
}

function getDisplayName(fileName) {
  return fileName.replace(/\.[^/.]+$/, '');
}

// --- Layer management ---
function addGeoJsonLayer(name, geojson) {
  const id = `layer-${layerIdCounter++}`;

  const layerGroup = L.geoJSON(geojson, {
    style: getFeatureStyle,
    onEachFeature,
    pointToLayer,
  }).addTo(map);

  geoJsonLayers.set(id, { layerGroup, name, data: geojson });

  addLayerListItem(id, name);
  fitToAllLayers();

  return id;
}

function removeGeoJsonLayer(id) {
  const entry = geoJsonLayers.get(id);
  if (!entry) return;
  map.removeLayer(entry.layerGroup);
  geoJsonLayers.delete(id);

  const li = document.querySelector(`[data-layer-id="${id}"]`);
  if (li && li.parentNode) li.parentNode.removeChild(li);

  fitToAllLayers();
  persistState();
}

function toggleGeoJsonLayer(id, visible) {
  const entry = geoJsonLayers.get(id);
  if (!entry) return;
  if (visible) {
    entry.layerGroup.addTo(map);
  } else {
    map.removeLayer(entry.layerGroup);
  }
  fitToAllLayers();
}

function fitToAllLayers() {
  const allBounds = [];
  geoJsonLayers.forEach(({ layerGroup }) => {
    const b = layerGroup.getBounds && layerGroup.getBounds();
    if (b && b.isValid && b.isValid()) {
      allBounds.push(b);
    }
  });
  if (!allBounds.length) return;

  let combined = allBounds[0];
  for (let i = 1; i < allBounds.length; i++) {
    combined = combined.extend(allBounds[i]);
  }
  if (combined && combined.isValid && combined.isValid()) {
    map.fitBounds(combined, { padding: [20, 20] });
  }
}

function zoomToLayer(id) {
  const entry = geoJsonLayers.get(id);
  if (!entry) return;
  const b = entry.layerGroup.getBounds && entry.layerGroup.getBounds();
  if (b && b.isValid && b.isValid()) {
    map.fitBounds(b, { padding: [20, 20] });
  }
}

function addLayerListItem(id, name) {
  const li = document.createElement('li');
  li.className = 'layer-item';
  li.dataset.layerId = id;

  const left = document.createElement('div');
  left.className = 'layer-left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = true;

  const label = document.createElement('span');
  label.className = 'layer-name';
  label.title = name;
  label.textContent = name;

  left.appendChild(checkbox);
  left.appendChild(label);

  const trash = document.createElement('button');
  trash.className = 'layer-trash';
  trash.title = 'Rimuovi layer';
  trash.textContent = '🗑';

  li.appendChild(left);
  li.appendChild(trash);
  layerList.appendChild(li);

  checkbox.addEventListener('change', () => {
    toggleGeoJsonLayer(id, checkbox.checked);
    persistState();
  });

  trash.addEventListener('click', () => {
    removeGeoJsonLayer(id);
  });

  // Doppio clic sinistro sul nome: zoom sul layer
  label.addEventListener('dblclick', () => {
    zoomToLayer(id);
  });

  // Click destro sul nome del layer: rinomina inline (senza finestre del browser)
  label.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    const currentName = label.textContent || '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'layer-name-input';
    input.value = currentName;
    input.title = 'Rename layer';

    left.replaceChild(input, label);
    input.focus();
    input.select();

    const finish = (commit) => {
      const newName = input.value;
      left.replaceChild(label, input);

      if (!commit) return;
      const trimmed = (newName || '').trim();
      if (!trimmed || trimmed === currentName) return;

      label.textContent = trimmed;
      label.title = trimmed;
      const entry = geoJsonLayers.get(id);
      if (entry) {
        entry.name = trimmed;
      }
      persistState();
    };

    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') finish(true);
      else if (ev.key === 'Escape') finish(false);
    });
  });
}

// --- File loading ---
async function handleFiles(files) {
  for (const file of files) {
    if (!file || !file.name) continue;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json || json.type !== 'FeatureCollection') {
        console.warn(
          'File non è un FeatureCollection GeoJSON valido:',
          file.name,
        );
        continue;
      }
      const displayName = getDisplayName(file.name);
      const id = addGeoJsonLayer(displayName, json);
      console.log('GeoJSON caricato:', displayName, id);
    } catch (e) {
      console.error('Errore nel file', file.name, e);
    }
  }
  persistState();
}

fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files && files.length) {
    if (fileInputPlaceholder) {
      if (files.length === 1) {
        fileInputPlaceholder.textContent = getDisplayName(files[0].name);
      } else {
        fileInputPlaceholder.textContent = `${files.length} files selected`;
      }
    }
    handleFiles(files);
  }
});

// Drag & drop sulla mappa
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  map.getContainer().addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach((eventName) => {
  map.getContainer().addEventListener(eventName, () => {
    map.getContainer().classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  map.getContainer().addEventListener(eventName, () => {
    map.getContainer().classList.remove('drag-over');
  });
});

map.getContainer().addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt && dt.files;
  if (files && files.length) {
    handleFiles(files);
  }
});

// --- Draggable panel ---
(function makePanelDraggable() {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  panelHeader.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = `${startLeft + dx}px`;
    panel.style.top = `${startTop + dy}px`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';
  });
})();

// --- Persistenza stato in browser.storage.local ---
const STORAGE_KEY = 'mapOverLayer:lastState';

function serializeState() {
  const layers = [];
  geoJsonLayers.forEach((value, id) => {
    // Manteniamo nome, dati e visibilità (checkbox)
    const li = document.querySelector(`[data-layer-id="${id}"]`);
    const visible = li
      ? li.querySelector('input[type="checkbox"]').checked
      : true;
    layers.push({
      id,
      name: value.name,
      data: value.data,
      visible,
    });
  });
  return { layers };
}

function persistState() {
  const state = serializeState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}


function restoreState(state) {
  if (!state || !Array.isArray(state.layers)) return;
  state.layers.forEach((l) => {
    const newId = addGeoJsonLayer(l.name, l.data);
    // Forziamo la visibilità come nello stato salvato
    const li = document.querySelector(`[data-layer-id="${newId}"]`);
    if (li) {
      const checkbox = li.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = l.visible;
      }
      toggleGeoJsonLayer(newId, l.visible);
    }
  });
}

const savedState = localStorage.getItem(STORAGE_KEY);
if (savedState) {
  restoreState(JSON.parse(savedState));
}
