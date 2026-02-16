# MaPage (WIP)

**MaPage** (Map Page) is a lightweight GitHub Page built with Leaflet that allows users to load and visualize Vector (GeoJSON) and Raster (GeoTIFF) files.

Map Page aims to be a simple, minimal client-side map viewer with:

- Import and view your own GeoJSON or GeoTIFF files, automatically applying default styles or preserving styles defined in the file
- View feature details in popups by clicking on layers
- Inline layer renaming and toggling by right-clicking on layer name
- Zoom to layer feature by double-clicking on layer name
- No ads
- No Registration or authentication
- Fully runs in the browser


## [🚀 Go to MaPage](https://gujooo.github.io/MaPage/)

---

## Styling
### GeoJSON

You can customize the style of each feature in your GeoJSON file by adding specific properties to the `properties` object.

> **Note:**
> - If a feature has no styling properties, the default values above are applied automatically.
> - The field names are **case-sensitive**; different field names will be treated as feature details and showed in popups.

#### Point / MultiPoint

| Property    | Type     | Description                         | Default  |
|------------|---------|-------------------------------------|---------|
| radius     | number  | Circle marker radius                | 6       |
| color      | string  | Stroke color                        | ![#0066cc](https://img.shields.io/badge/%230066cc-0066cc?style=flat-square) |
| fillColor  | string  | Fill color                          | ![#3399ff](https://img.shields.io/badge/%233399ff-3399ff?style=flat-square) |
| weight     | number  | Stroke width                        | 2       |
| opacity    | number  | Stroke opacity (0–1)               | 1       |
| fillOpacity| number  | Fill opacity (0–1)                 | 0.8     |

#### LineString / MultiLineString

| Property | Type    | Description            | Default   |
|----------|--------|------------------------|-----------|
| color    | string | Line color             | ![#ff8800](https://img.shields.io/badge/%23ff8800-ff8800?style=flat-square) |
| weight   | number | Line width             | 3         |
| opacity  | number | Line opacity (0–1)     | 0.9       |

#### Polygon / MultiPolygon

| Property   | Type    | Description           | Default   |
|------------|--------|----------------------|-----------|
| color      | string | Stroke color          | ![#0f550f](https://img.shields.io/badge/%230f550f-0f550f?style=flat-square) |
| weight     | number | Stroke width          | 2         |
| opacity    | number | Stroke opacity (0–1) | 0.8       |
| fillColor  | string | Fill color            | ![#109310](https://img.shields.io/badge/%23109310-109310?style=flat-square) |
| fillOpacity| number | Fill opacity (0–1)    | 0.3       |

#### Default (all other geometry types)

| Property   | Type    | Description           | Default   |
|------------|--------|----------------------|-----------|
| color      | string | Stroke color          | ![#444](https://img.shields.io/badge/%23444-444?style=flat-square) |
| weight     | number | Stroke width          | 2         |
| opacity    | number | Stroke opacity (0–1) | 0.8       |
| fillColor  | string | Fill color            | ![#888](https://img.shields.io/badge/%23888-888?style=flat-square) |
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
---

## Credits

MaPage is built using the following open-source libraries and data sources:

- **[Leaflet](https://leafletjs.com/)** – Interactive maps library  
- **[OpenStreetMap](https://www.openstreetmap.org/)** – Base map data  
- **[georaster](https://github.com/GeoTIFF/georaster)** – Client-side GeoTIFF parsing  
- **[georaster-layer-for-leaflet](https://github.com/GeoTIFF/georaster-layer-for-leaflet)** – GeoTIFF rendering in Leaflet  
- **[GeoTIFF.js](https://github.com/geotiffjs/geotiff.js)** – GeoTIFF decoding library  

### Data Attribution

Map tiles [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

