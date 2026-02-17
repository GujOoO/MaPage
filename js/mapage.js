/* =========================================================
   MAP INITIALIZATION (Leaflet + OpenStreetMap base layer)
========================================================= */

// Default map position (Turin, Italy)
const defaultCenter = [45.0678, 7.6741];
const defaultZoom = 12;

// OpenStreetMap tile layer
const osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      'Map data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> | ' +
      '<a href="https://github.com/GujOoO/MaPage" target="_blank" rel="noopener noreferrer">GujOoO/<strong>MaPage</strong></a>',
  }
);

// Create Leaflet map instance
const map = L.map('map', {
  center: defaultCenter,
  zoom: defaultZoom,
  layers: [osm],
});

/* =========================================================
   DOM REFERENCES
========================================================= */

const fileInput = document.getElementById('fileInput');
const filePlaceholderText = document.getElementById('filePlaceholderText');
const fileBrowseTrigger = document.getElementById('fileBrowseTrigger');
const fileInputPlaceholder = document.getElementById('fileInputPlaceholder');
const layerList = document.getElementById('layerList');
const panel = document.getElementById('control-panel');
const panelHeader = document.getElementById('panel-header');
const loadingOverlay = document.getElementById('loading-overlay');

// Event delegation for dynamic Browser trigger
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'fileBrowseTrigger') {
    fileInput.click();
  }
});


/* Loading */
function showLoader() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoader() {
  loadingOverlay.classList.add('hidden');
}


/* =========================================================
   APPLICATION STATE (Multiple GeoJSON layers management)
========================================================= */

// Incremental ID generator for layers
let layerIdCounter = 0;

// Store loaded layers
// id -> { layerGroup, name, data }
const layers = new Map();

/* =========================================================
   GEOJSON STYLING LOGIC
========================================================= */

// Returns a style object depending on geometry type
function getFeatureStyle(feature) {
  const type = feature.geometry && feature.geometry.type;

  switch (type) {
    case 'Point':
    case 'MultiPoint':
      return {
        radius: feature.properties.radius ?? 6,
        color: feature.properties.color ?? '#0066cc',
        fillColor: feature.properties.fillColor ?? '#3399ff',
        weight: feature.properties.weight ?? 2,
        opacity: feature.properties.opacity ?? 1,
        fillOpacity: feature.properties.fillOpacity ?? 0.8,
      };

    case 'LineString':
    case 'MultiLineString':
      return {
        color: feature.properties.color ?? '#ff8800',
        weight: feature.properties.weight ?? 3,
        opacity: feature.properties.opacity ?? 0.9,
      };

    case 'Polygon':
    case 'MultiPolygon':
      return {
        color: feature.properties.color ?? '#0f550f',
        weight: feature.properties.weight ?? 2,
        opacity: feature.properties.opacity ?? 0.8,
        fillColor: feature.properties.fillColor ?? '#109310',
        fillOpacity: feature.properties.fillOpacity ?? 0.3,
      };

    default:
      return {
        color: feature.properties.color ?? '#444',
        weight: feature.properties.weight ?? 2,
        opacity: feature.properties.opacity ?? 0.8,
        fillColor: feature.properties.fillColor ?? '#888',
        fillOpacity: feature.properties.fillOpacity ?? 0.2,
      };
  }
}

// Attach popup and hover behavior to each feature
function onEachFeature(feature, layer) {
  // Generate popup from feature properties
  if (feature.properties) {
    const styleFields = [
      'color',
      'weight',
      'opacity',
      'fillColor',
      'fillOpacity',
      'radius'
    ];

    const entries = Object.entries(feature.properties)
      .filter(([k, v]) =>
        !styleFields.includes(k) && 
        v !== null &&
       v !== ''
      )
      .map(([k, v]) => `<strong>${k}</strong>: ${v}`)
      .join('<br />');

    if (entries) layer.bindPopup(entries);
  }

  // Highlight effect on hover
  layer.on({
    mouseover: (e) => {
      const target = e.target;
      if (target.setStyle) {
        target.setStyle({ weight: 4, opacity: 1 });
      }
    },
    mouseout: (e) => {
      const target = e.target;
      if (target.setStyle) {
        target.setStyle(getFeatureStyle(feature));
      }
    },
  });
}

// Convert point features into circle markers
function pointToLayer(feature, latlng) {
  return L.circleMarker(latlng, getFeatureStyle(feature));
}

// Remove file extension from filename
function getDisplayName(fileName) {
  return fileName.replace(/\.[^/.]+$/, '');
}

/* =========================================================
   GEOTIFF / COG SUPPORT (Client-side rendering)
========================================================= */
// Add a GeoTIFF (including COG) layer to the map
async function addGeoTiffLayer(name, file) {

  const id = `layer-${layerIdCounter++}`;

  // Read file as ArrayBuffer (works for local COG)
  const arrayBuffer = await file.arrayBuffer();

  const georaster = await parseGeoraster(arrayBuffer);

  const rasterLayer = new GeoRasterLayer({
    georaster: georaster,
    opacity: 0.8,
    resolution: 256,

    // Simple grayscale stretch
    pixelValuesToColorFn: (values) => {

      const value = values[0];

      if (
        value === null ||
        value === undefined ||
        value === georaster.noDataValue
      ) return null;

      const min = georaster.mins[0];
      const max = georaster.maxs[0];

      const normalized = (value - min) / (max - min);
      const gray = Math.floor(normalized * 255);

      return `rgb(${gray},${gray},${gray})`;
    }
  });

  rasterLayer.addTo(map);

  layers.set(id, {
    layer: rasterLayer,
    name,
    type: 'raster',
    data: null
  });

  addLayerListItem(id, name);

  map.fitBounds(rasterLayer.getBounds());

  return id;
}


/* =========================================================
   LAYER MANAGEMENT
========================================================= */

// Add a new Vector layer to the map
function addVectorLayer(name, geojson) {
  const id = `layer-${layerIdCounter++}`;

  const layerGroup = L.geoJSON(geojson, {
    style: getFeatureStyle,
    onEachFeature,
    pointToLayer,
  }).addTo(map);

  layers.set(id, {
    layer: layerGroup,
    name,
    type: 'vector',
    data: geojson
  });

  addLayerListItem(id, name);
  fitToAllLayers();

  return id;
}

// Remove a Layer
function removeLayer(id) {
  const entry = layers.get(id);
  if (!entry) return;

  map.removeLayer(entry.layer);
  layers.delete(id);

  const li = document.querySelector(`[data-layer-id="${id}"]`);
  if (li) li.remove();

  // Update header visibility after removing a layer
  updatePanelHeaderVisibility();

  fitToAllLayers();
  persistState();
}

// Toggle Layer visibility
function toggleLayer(id, visible) {
  const entry = layers.get(id);
  if (!entry) return;

  if (visible) entry.layer.addTo(map);
  else map.removeLayer(entry.layer);

  fitToAllLayers();
}

// Fit map view to all visible layers
function fitToAllLayers() {
  const allBounds = [];

  layers.forEach(({ layer }) => {
    const b = layer.getBounds?.();
    if (b?.isValid?.()) allBounds.push(b);
  });

  if (!allBounds.length) return;

  let combined = allBounds[0];
  for (let i = 1; i < allBounds.length; i++) {
    combined = combined.extend(allBounds[i]);
  }

  if (combined?.isValid?.()) {
    map.fitBounds(combined, { padding: [20, 20] });
  }
}

// Zoom only to one layer
function zoomToLayer(id) {
  const entry = layers.get(id);
  if (!entry) return;

  const b = entry.layer.getBounds?.();
  if (b?.isValid?.()) {
    map.fitBounds(b, { padding: [20, 20] });
  }
}

/* =========================================================
   LAYER LIST UI
========================================================= */
// Update panel header visibility based on whether there are layers
function updatePanelHeaderVisibility() {
  if (layerList.children.length > 0) {
    panelHeader.style.display = 'none';
  } else {
    panelHeader.style.display = 'flex';

    // Reset placeholder text
    filePlaceholderText.textContent = 'or Drag&Drop';

    // Reset file input (importantissimo)
    fileInput.value = '';
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
  label.textContent = name;
  label.title = name;

  left.append(checkbox, label);

  const trash = document.createElement('button');
  trash.className = 'layer-trash';
  trash.textContent = '🗑';
  trash.title = 'Remove layer';

  li.append(left, trash);
  layerList.appendChild(li);

  // Update header visibility after adding a layer
  updatePanelHeaderVisibility(); 

  // Visibility toggle
  checkbox.addEventListener('change', () => {
    toggleLayer(id, checkbox.checked);
    persistState();
  });

  // Remove layer
  trash.addEventListener('click', () => {
    removeLayer(id);
  });

  // Double click to zoom
  label.addEventListener('dblclick', () => {
    zoomToLayer(id);
  });

  // Right click to rename (inline editing)
  label.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    const input = document.createElement('input');
    input.type = 'text';
    input.value = label.textContent;
    input.className = 'layer-name-input';

    left.replaceChild(input, label);
    input.focus();
    input.select();

    const finish = (commit) => {
      left.replaceChild(label, input);
      if (!commit) return;

      const trimmed = input.value.trim();
      if (!trimmed) return;

      label.textContent = trimmed;
      label.title = trimmed;

      const entry = layers.get(id);
      if (entry) entry.name = trimmed;

      persistState();
    };

    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') finish(true);
      if (ev.key === 'Escape') finish(false);
    });
  });
}

/* =========================================================
   FILE LOADING (Input + Drag & Drop)
========================================================= */

async function handleFiles(files) {

  if (!files?.length) return;

  showLoader();

  try {

    for (const file of files) {

      const extension = file.name.split('.').pop().toLowerCase();

      // GeoJSON
      if (extension === 'geojson' || extension === 'json') {

        const text = await file.text();
        const json = JSON.parse(text);

        if (json.type === 'FeatureCollection') {
          const displayName = getDisplayName(file.name);
          addVectorLayer(displayName, json);
        }
      }

      // GeoTIFF / COG
      else if (extension === 'tif' || extension === 'tiff') {

        const displayName = getDisplayName(file.name);
        await addGeoTiffLayer(displayName, file);
      }
    }

  } catch (e) {
    console.error('Invalid file:', e);
  } finally {
    hideLoader();
  }

  persistState();
}


// File input handler
fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files?.length) return;

  if (files.length === 1)
    filePlaceholderText.textContent = getDisplayName(files[0].name);
  else
    filePlaceholderText.textContent = `${files.length} files selected`;

  handleFiles(files);
});

// Prevent default browser drag behavior
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Enable drag & drop on map container
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((event) => {
  map.getContainer().addEventListener(event, preventDefaults);
});

map.getContainer().addEventListener('drop', (e) => {
  const files = e.dataTransfer?.files;
  if (files?.length) handleFiles(files);
});

/* =========================================================
   DRAGGABLE CONTROL PANEL
========================================================= */

(function makePanelDraggable() {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  panel.addEventListener('mousedown', (e) => {
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

    panel.style.left = `${startLeft + (e.clientX - startX)}px`;
    panel.style.top = `${startTop + (e.clientY - startY)}px`;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });
})();

/* =========================================================
   LOCAL STORAGE PERSISTENCE
========================================================= */

const STORAGE_KEY = 'mapOverLayer:lastState';

// Convert current layers to serializable object
function serializeState() {

  const serializedLayers = [];

  layers.forEach((value, id) => {

    if (value.type !== 'vector') return; // skip raster

    const li = document.querySelector(`[data-layer-id="${id}"]`);
    const visible = li?.querySelector('input')?.checked ?? true;

    serializedLayers.push({
      name: value.name,
      data: value.data,
      visible
    });
  });

  return { layers: serializedLayers };
}

// Save state to localStorage
function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
}

// Restore layers from localStorage
function restoreState(state) {
  if (!state?.layers) return;

  state.layers.forEach((l) => {
    const newId = addVectorLayer(l.name, l.data);

    const li = document.querySelector(`[data-layer-id="${newId}"]`);
    const checkbox = li?.querySelector('input');

    if (checkbox) checkbox.checked = l.visible;
    toggleLayer(newId, l.visible);
  });
}

// Load saved state on startup
const savedState = localStorage.getItem(STORAGE_KEY);
if (savedState) restoreState(JSON.parse(savedState));
