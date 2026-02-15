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
const fileInputPlaceholder = document.getElementById('fileInputPlaceholder');
const layerList = document.getElementById('layerList');
const panel = document.getElementById('control-panel');
const panelHeader = document.getElementById('panel-header');

/* =========================================================
   APPLICATION STATE (Multiple GeoJSON layers management)
========================================================= */

// Incremental ID generator for layers
let layerIdCounter = 0;

// Store loaded layers
// id -> { layerGroup, name, data }
const geoJsonLayers = new Map();

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
    const entries = Object.entries(feature.properties)
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
   LAYER MANAGEMENT
========================================================= */

// Add a new GeoJSON layer to the map
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

// Remove a GeoJSON layer
function removeGeoJsonLayer(id) {
  const entry = geoJsonLayers.get(id);
  if (!entry) return;

  map.removeLayer(entry.layerGroup);
  geoJsonLayers.delete(id);

  const li = document.querySelector(`[data-layer-id="${id}"]`);
  if (li) li.remove();

  // Update header visibility after removing a layer
  updatePanelHeaderVisibility();

  fitToAllLayers();
  persistState();
}

// Toggle layer visibility
function toggleGeoJsonLayer(id, visible) {
  const entry = geoJsonLayers.get(id);
  if (!entry) return;

  if (visible) entry.layerGroup.addTo(map);
  else map.removeLayer(entry.layerGroup);

  fitToAllLayers();
}

// Fit map view to all visible layers
function fitToAllLayers() {
  const allBounds = [];

  geoJsonLayers.forEach(({ layerGroup }) => {
    const b = layerGroup.getBounds?.();
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
  const entry = geoJsonLayers.get(id);
  if (!entry) return;

  const b = entry.layerGroup.getBounds?.();
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
    panelHeader.style.display = 'none'; // hide header if there are layers
  } else {
    panelHeader.style.display = 'flex'; // show header if there are layers
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
    toggleGeoJsonLayer(id, checkbox.checked);
    persistState();
  });

  // Remove layer
  trash.addEventListener('click', () => {
    removeGeoJsonLayer(id);
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

      const entry = geoJsonLayers.get(id);
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
  for (const file of files) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (json.type !== 'FeatureCollection') continue;

      const displayName = getDisplayName(file.name);
      addGeoJsonLayer(displayName, json);
    } catch (e) {
      console.error('Invalid file:', file.name, e);
    }
  }

  persistState();
}

// File input handler
fileInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files?.length) return;

  if (files.length === 1)
    fileInputPlaceholder.textContent = getDisplayName(files[0].name);
  else fileInputPlaceholder.textContent = `${files.length} files selected`;

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
  const layers = [];

  geoJsonLayers.forEach((value, id) => {
    const li = document.querySelector(`[data-layer-id="${id}"]`);
    const visible = li?.querySelector('input')?.checked ?? true;

    layers.push({
      name: value.name,
      data: value.data,
      visible,
    });
  });

  return { layers };
}

// Save state to localStorage
function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
}

// Restore layers from localStorage
function restoreState(state) {
  if (!state?.layers) return;

  state.layers.forEach((l) => {
    const newId = addGeoJsonLayer(l.name, l.data);

    const li = document.querySelector(`[data-layer-id="${newId}"]`);
    const checkbox = li?.querySelector('input');

    if (checkbox) checkbox.checked = l.visible;
    toggleGeoJsonLayer(newId, l.visible);
  });
}

// Load saved state on startup
const savedState = localStorage.getItem(STORAGE_KEY);
if (savedState) restoreState(JSON.parse(savedState));
