# MaPage

**MaPage** (Map Page) is a minimal GitHub Page designed to read and visualize GeoJSON and GeoTIFF files directly in your browser; it is a fully client-side map viewer powered by Leaflet.

It was built with one goal in mind: to let anyone open and explore geospatial data without installing software, creating accounts, or uploading files to third-party platforms.

##### Features
- Load and visualize your own GeoJSON (vector) and GeoTIFF (raster) files
- User-friendly interface:
  - Click features to view their attributes in popups
  - Rename and toggle layers with a right-click
  - Zoom to a layer’s extent with a double-click
  - Choose your own color palette for rasters or import your style for vector layers
- No registration or authentication
- No ads

 ...just a simple static GitHub Page.

> ## [🚀 Go to MaPage](https://gujooo.github.io/MaPage/)

---

## Tutorial
![video](/images/Tutorial_202602.mp4)
---
## Import Your Style
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

### GeoTIFF
GeoTIFF files uploaded to **MaPage** are handled differently depending on their band structure:
 - RGB (three-band raster)
 - PCT / Single-band raster

##### Single-band GeoTIFF (PCT)
By default, single-band GeoTIFF files are rendered using a grayscale stretch.
The color palette can be changed at any time by clicking the color bar in the layer legend selecting one of the available color maps.

##### RGB GeoTIFF (three-band)

By default, RGB GeoTIFF files preserve their original embedded colors. However, users can optionally convert the RGB raster into a pseudo-color single-band visualization by selecting a color palette from the legend (via the “`to PCT`” control).

It is always possible to revert back to the default rendering using the “`canc`” option in the palette menu.

#### Available Color Palettes
The following color palettes are available for single-band rendering and RGB-to-PCT conversion:

| Palette     | Preview                                      |
| ----------- | --------------------------- |
| Grayscale   | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#000000,#ffffff);"></div>    |
| Grayscale   | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#ffffff,#000000);"></div>                |
| Viridis     | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#440154,#482777,#3f4a8a,#31688e,#26828e,#1f9e89,#35b779,#6ece58,#b5de2b,#fde725);"></div> |
| Reverse Viridis     | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#fde725,#b5de2b,#6ece58,#35b779,#1f9e89,#26828e,#31688e,#3f4a8a,#482777,#440154);"></div> |
| Magma       | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#000004,#1b0c41,#4f0a6d,#781c6d,#a52c60,#cf4446,#ed6925,#fb9b06,#f7d13d,#fcfdbf);"></div> |
| Reverse Magma       | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#fcfdbf,#f7d13d,#fb9b06,#ed6925,#cf4446,#a52c60,#781c6d,#4f0a6d,#1b0c41,#000004);"></div> |
| YlOrRd      | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#ffffb2,#fecc5c,#fd8d3c,#f03b20,#b10026);"></div>                         |
| RdOrYl      | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#bd0026,#f03b20,#fd8d3c,#fecc5c,#ffffb2);"></div>                                         |
| BlWtRd  | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#0718AD,#ffffff,#D10F0F);"></div>                                         |
| RdWtBl  | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#D10F0F,#ffffff,#0718AD);"></div>                                         |
| Greens      | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#f7fcf5,#e5f5e0,#c7e9c0,#a1d99b,#74c476,#41ab5d,#238b45,#005a32);"></div>                 |
| Reverse Greens | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#2e7d32,#4caf50,#81c784,#a5d6a7,#c8e6c9);"></div>                                         |
| Blues       | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#f7fbff,#deebf7,#c6dbef,#9ecae1,#6baed6,#4292c6,#2171b5,#084594);"></div>                 |
| Reverse Blues  | <div style="width:160px;height:10px;border-radius:3px;background:linear-gradient(to right,#0d47a1,#1976d2,#42a5f5,#90caf9,#bbdefb);"></div>                                         |


---

## Credits

MaPage is built using the following open-source libraries and data sources:

- **[Leaflet](https://leafletjs.com/)** – Interactive maps library  
- **[OpenStreetMap](https://www.openstreetmap.org/)** – Base map data  
- **[Georaster](https://github.com/GeoTIFF/georaster)** – Client-side GeoTIFF parsing  
- **[Georaster-layer-for-leaflet](https://github.com/GeoTIFF/georaster-layer-for-leaflet)** – GeoTIFF rendering in Leaflet  
- **[GeoTIFF.js](https://github.com/geotiffjs/geotiff.js)** – GeoTIFF decoding library  



