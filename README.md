# MaPage (WIP)

**MaPage** (Map Page) is a lightweight web application built with Leaflet that allows users to load and visualize GeoJSON files via Drag & Drop.

Map Page aims to be a simple, minimal client-side map viewer with:

- Import and view your own GeoJSON files (Drag & Drop), automatically applying default styles or preserving styles defined in the file
- View feature details in popups by clicking on layers
- Inline layer renaming and toggling by right-clicking on layer name
- Zoom to layer feature by double-clicking on layer name
- No ads
- No Registration or authentication
- Fully runs in the browser

---

### [🚀 Go to MaPage](https://gujooo.github.io/MaPage/)

---

# Styling
## GeoJSON

You can customize the style of each feature in your GeoJSON file by adding specific properties to the `properties` object.

> **Note:**
> - If a feature has no styling properties, the default values above are applied automatically.
> - The field names are **case-sensitive**; different field names will be treated as feature details in popups.

### Point / MultiPoint

| Property    | Type     | Description                         | Default  |
|------------|---------|-------------------------------------|---------|
| radius     | number  | Circle marker radius                | 6       |
| color      | string  | Stroke color                        | <span style="display:inline-block;width:12px;height:12px;background:#0066cc;"></span> `#0066cc` |
| fillColor  | string  | Fill color                          | <span style="display:inline-block;width:12px;height:12px;background:#3399ff;"></span> `#3399ff` |
| weight     | number  | Stroke width                        | 2       |
| opacity    | number  | Stroke opacity (0–1)               | 1       |
| fillOpacity| number  | Fill opacity (0–1)                 | 0.8     |

### LineString / MultiLineString

| Property | Type    | Description            | Default   |
|----------|--------|------------------------|-----------|
| color    | string | Line color             | <span style="display:inline-block;width:12px;height:12px;background:#ff8800;"></span> `#ff8800` |
| weight   | number | Line width             | 3         |
| opacity  | number | Line opacity (0–1)     | 0.9       |

### Polygon / MultiPolygon

| Property   | Type    | Description           | Default   |
|------------|--------|----------------------|-----------|
| color      | string | Stroke color          | <span style="display:inline-block;width:12px;height:12px;background:#0f550f;"></span> `#0f550f` |
| weight     | number | Stroke width          | 2         |
| opacity    | number | Stroke opacity (0–1) | 0.8       |
| fillColor  | string | Fill color            | <span style="display:inline-block;width:12px;height:12px;background:#109310;"></span> `#109310` |
| fillOpacity| number | Fill opacity (0–1)    | 0.3       |

### Default (all other geometry types)

| Property   | Type    | Description           | Default   |
|------------|--------|----------------------|-----------|
| color      | string | Stroke color          | <span style="display:inline-block;width:12px;height:12px;background:#444;"></span> `#444`    |
| weight     | number | Stroke width          | 2         |
| opacity    | number | Stroke opacity (0–1) | 0.8       |
| fillColor  | string | Fill color            | <span style="display:inline-block;width:12px;height:12px;background:#888;"></span> `#888`    |
| fillOpacity| number | Fill opacity (0–1)    | 0.2       |


An example of GeoJSON:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "Name": "Sample Point - Belluno",
        "Description": "Random <b style='color:red;'>Sample Point</b> over the city of Belluno Italy",
        "radius": 8,
        "color": "#ff0000",
        "opacity": 0.3,
        "fillOpacity": 1
      },
      "geometry": {
        "type": "Point",
        "coordinates": [12.21965981437214, 46.13839927599409]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "Name": "Sample Line - Belluno",
        "color": "#00aa00",
        "weight": 4,
        "opacity": 0.8
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [12.217615781551348, 46.13601868071367], 
          [12.221664565028005, 46.13748580940446],
          [12.222648902295266, 46.136134508084105]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "Name": "Sample Polygon - Belluno",
        "Description":"Rectangular polygon over the city of Belluno Italy",
        "color": "#0000ff",
        "fillColor": "#ccccff",
        "weight": 2,
        "opacity": 0.9,
        "fillOpacity": 0.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [12.215, 46.137],
            [12.219, 46.137],
            [12.219, 46.139],
            [12.215, 46.139],
            [12.215, 46.137]
          ]
        ]
      }
    }
  ]
}
```