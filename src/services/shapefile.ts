/**
 * ESRI Shapefile Export Utility
 * 
 * Generates real Shapefile (.shp + .shx + .dbf) files for polygon data.
 * Each polygon gets its own set of files, bundled into a ZIP archive.
 */

interface Vertex { lat: number; lng: number; }
interface PolygonData { name: string; vertices: Vertex[]; areaHa: number; cropType?: string; }

function writeInt32(bytes: DataView, offset: number, value: number, bigEndian = false) {
  if (bigEndian) bytes.setInt32(offset, value, false);
  else bytes.setInt32(offset, value, true);
}
function writeDouble(bytes: DataView, offset: number, value: number) {
  bytes.setFloat64(offset, value, true);
}

/** Generate .shp binary for a single polygon */
function generateShp(vertices: Vertex[]): ArrayBuffer {
  const numPoints = vertices.length;
  const contentLength = 4 + 32 + 4 + 4 + 4 + (16 * numPoints);
  const recordLengthWords = (8 + contentLength) / 2;
  const fileLength = 50 + recordLengthWords;

  const buf = new ArrayBuffer(fileLength * 2);
  const dv = new DataView(buf);

  // File header (big-endian)
  writeInt32(dv, 0, 9994, true);
  writeInt32(dv, 4, 0, true); writeInt32(dv, 8, 0, true); writeInt32(dv, 12, 0, true);
  writeInt32(dv, 16, 0, true); writeInt32(dv, 20, 0, true);
  writeInt32(dv, 24, fileLength, true);
  writeInt32(dv, 28, 1000, true);
  writeInt32(dv, 32, 5, true); // Polygon

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  vertices.forEach(v => { minLng = Math.min(minLng, v.lng); maxLng = Math.max(maxLng, v.lng); minLat = Math.min(minLat, v.lat); maxLat = Math.max(maxLat, v.lat); });

  writeDouble(dv, 36, minLng); writeDouble(dv, 44, minLat);
  writeDouble(dv, 52, maxLng); writeDouble(dv, 60, maxLat);
  writeDouble(dv, 68, 0); writeDouble(dv, 76, 0); writeDouble(dv, 84, 0); writeDouble(dv, 92, 0);

  // Record header (big-endian)
  writeInt32(dv, 100, 1, true);
  writeInt32(dv, 104, contentLength / 2, true);

  // Record content (little-endian)
  writeInt32(dv, 108, 5, true); // Polygon
  writeDouble(dv, 112, minLng); writeDouble(dv, 120, minLat);
  writeDouble(dv, 128, maxLng); writeDouble(dv, 136, maxLat);
  writeInt32(dv, 144, 1, true); // NumParts
  writeInt32(dv, 148, numPoints, true); // NumPoints
  writeInt32(dv, 152, 0, true); // Parts

  let off = 156;
  vertices.forEach(v => { writeDouble(dv, off, v.lng); writeDouble(dv, off + 8, v.lat); off += 16; });

  return buf;
}

/** Generate .shx index file */
function generateShx(vertices: Vertex[]): ArrayBuffer {
  const numPoints = vertices.length;
  const contentLen = 4 + 32 + 4 + 4 + 4 + (16 * numPoints);
  const recWords = (8 + contentLen) / 2;
  const fileLen = 50 + 4;

  const buf = new ArrayBuffer(fileLen * 2);
  const dv = new DataView(buf);

  writeInt32(dv, 0, 9994, true); writeInt32(dv, 24, fileLen, true);
  writeInt32(dv, 28, 1000, true); writeInt32(dv, 32, 5, true);

  let mLng = Infinity, MLng = -Infinity, mLat = Infinity, MLat = -Infinity;
  vertices.forEach(v => { mLng = Math.min(mLng, v.lng); MLng = Math.max(MLng, v.lng); mLat = Math.min(mLat, v.lat); MLat = Math.max(MLat, v.lat); });
  writeDouble(dv, 36, mLng); writeDouble(dv, 44, mLat);
  writeDouble(dv, 52, MLng); writeDouble(dv, 60, MLat);
  writeDouble(dv, 68, 0); writeDouble(dv, 76, 0); writeDouble(dv, 84, 0); writeDouble(dv, 92, 0);

  writeInt32(dv, 100, 50, true); // Offset
  writeInt32(dv, 104, recWords, true); // Content length
  return buf;
}

/** Generate .dbf file for one field */
function generateDbf(name: string, areaHa: number, cropType?: string): ArrayBuffer {
  const fieldDefs = [
    { n: 'id', t: 'N', l: 10, d: 0 },
    { n: 'name', t: 'C', l: 40, d: 0 },
    { n: 'area_ha', t: 'N', l: 14, d: 6 },
    { n: 'crop', t: 'C', l: 20, d: 0 },
  ];
  const hdrLen = 32 + (32 * fieldDefs.length) + 1;
  const recLen = fieldDefs.reduce((s, f) => s + f.l, 0) + 1;
  const buf = new ArrayBuffer(hdrLen + recLen);
  const dv = new DataView(buf);

  let off = 0;
  dv.setUint8(off, 0x03); off++;
  dv.setUint8(off, new Date().getFullYear() - 1900); off++;
  dv.setUint8(off, new Date().getMonth() + 1); off++;
  dv.setUint8(off, new Date().getDate()); off++;
  writeInt32(dv, off, 1, true); off += 4; // 1 record
  writeInt32(dv, off, hdrLen, true); off += 2;
  writeInt32(dv, off, recLen, true); off += 2;
  for (let i = 0; i < 20; i++) { dv.setUint8(off, 0); off++; }

  fieldDefs.forEach(fd => {
    const nb = new TextEncoder().encode(fd.n.substring(0, 11));
    for (let i = 0; i < 11; i++) dv.setUint8(off + i, i < nb.length ? nb[i] : 0);
    off += 11;
    dv.setUint8(off, fd.t.charCodeAt(0)); off++;
    for (let i = 0; i < 4; i++) dv.setUint8(off, 0), off++;
    dv.setUint8(off, fd.l); off++;
    dv.setUint8(off, fd.d); off++;
    for (let i = 0; i < 14; i++) dv.setUint8(off, 0), off++;
  });
  dv.setUint8(off, 0x0D); off++;

  // Record
  dv.setUint8(off, 0x20); off++;
  for (let i = 0; i < 10; i++) dv.setUint8(off, '1'.charCodeAt(0)), off++;
  for (let i = 0; i < 40; i++) dv.setUint8(off, (name[i] || ' ').charCodeAt(0)), off++;
  const a = areaHa.toFixed(6).padStart(14, ' ');
  for (let i = 0; i < 14; i++) dv.setUint8(off, a.charCodeAt(i)), off++;
  const c = (cropType || '').padEnd(20, ' ');
  for (let i = 0; i < 20; i++) dv.setUint8(off, c.charCodeAt(i)), off++;

  return buf;
}

/** PRJ file (WGS84 coordinate system) */
function generatePrj(): string {
  return `GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]`;
}

/**
 * Download all fields as ESRI Shapefile (.shp/.shx/.dbf/.prj per field, ZIP bundled)
 */
export async function downloadShapefile(polygons: PolygonData[]): Promise<void> {
  if (polygons.length === 0) return;

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  polygons.forEach((poly, idx) => {
    if (poly.vertices.length < 3) return;
    const safeName = poly.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const prefix = `${idx + 1}_${safeName}`;

    zip.file(`${prefix}.shp`, generateShp(poly.vertices));
    zip.file(`${prefix}.shx`, generateShx(poly.vertices));
    zip.file(`${prefix}.dbf`, generateDbf(poly.name, poly.areaHa, poly.cropType));
    zip.file(`${prefix}.prj`, generatePrj());
    zip.file(`${prefix}.cpg`, 'UTF-8');
  });

  // Also add a summary CSV
  let csv = 'id,name,area_ha,crop\n';
  polygons.forEach((p, i) => { csv += `${i + 1},${p.name},${p.areaHa.toFixed(4)},${p.cropType || ''}\n`; });
  zip.file('summary.csv', csv);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `khetmap_shapefiles_${polygons.length}fields.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
