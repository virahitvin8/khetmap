/**
 * ESRI Shapefile Export Utility
 * 
 * Generates real Shapefile (.shp + .shx + .dbf) files for polygon data.
 * Reference: ESRI Shapefile Technical Description
 */

interface Vertex {
  lat: number;
  lng: number;
}

interface ShapefileField {
  name: string;
  areaHa: number;
  cropType?: string;
}

// Little-endian encoding helpers
function writeInt32(bytes: DataView, offset: number, value: number, bigEndian = false) {
  if (bigEndian) bytes.setInt32(offset, value, false);
  else bytes.setInt32(offset, value, true);
}

function writeDouble(bytes: DataView, offset: number, value: number) {
  bytes.setFloat64(offset, value, true);
}

function writeInt16(bytes: DataView, offset: number, value: number, bigEndian = false) {
  if (bigEndian) bytes.setInt16(offset, value, false);
  else bytes.setInt16(offset, value, true);
}

/**
 * Generate .shp file (main file containing geometry)
 * Shape Type: 5 = Polygon
 */
function generateShp(vertices: Vertex[]): ArrayBuffer {
  const numPoints = vertices.length;
  // Record header: 8 bytes
  // Record content: ShapeType(4) + Box(32) + NumParts(4) + NumPoints(4) + Parts(4) + Points(16*numPoints)
  const contentLength = 4 + 32 + 4 + 4 + 4 + (16 * numPoints);
  const recordLength = 8 + contentLength; // header + content
  const fileLength = 50 + (recordLength / 2); // 50 words for header + record size in words

  const buffer = new ArrayBuffer(fileLength * 2); // 2 bytes per word
  const dv = new DataView(buffer);

  // --- File Header (100 bytes) ---
  writeInt32(dv, 0, 9994, true); // File code
  writeInt32(dv, 4, 0, true); // Unused
  writeInt32(dv, 8, 0, true); // Unused
  writeInt32(dv, 12, 0, true); // Unused
  writeInt32(dv, 16, 0, true); // Unused
  writeInt32(dv, 20, 0, true); // Unused
  writeInt32(dv, 24, fileLength, true); // File length (in 16-bit words)
  writeInt32(dv, 28, 1000, true); // Version (1000)
  writeInt32(dv, 32, 5, true); // Shape type: Polygon = 5

  // Bounding box (minX, minY, maxX, maxY, minZ, maxZ, minM, maxM)
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  vertices.forEach(v => {
    minLng = Math.min(minLng, v.lng);
    maxLng = Math.max(maxLng, v.lng);
    minLat = Math.min(minLat, v.lat);
    maxLat = Math.max(maxLat, v.lat);
  });

  writeDouble(dv, 36, minLng); // Xmin
  writeDouble(dv, 44, minLat); // Ymin
  writeDouble(dv, 52, maxLng); // Xmax
  writeDouble(dv, 60, maxLat); // Ymax
  writeDouble(dv, 68, 0); // Zmin
  writeDouble(dv, 76, 0); // Zmax
  writeDouble(dv, 84, 0); // Mmin
  writeDouble(dv, 92, 0); // Mmax

  // --- Record Header (8 bytes) ---
  const recordOffset = 50; // file header is 50 words (100 bytes) / 2
  writeInt32(dv, 100, 1, true); // Record number
  writeInt32(dv, 104, contentLength / 2, true); // Content length in words (big endian)

  // --- Record Content ---
  const contentOffset = 108;
  writeInt32(dv, contentOffset, 5, true); // Shape type: Polygon (little endian)
  
  // Box
  writeDouble(dv, contentOffset + 4, minLng);
  writeDouble(dv, contentOffset + 12, minLat);
  writeDouble(dv, contentOffset + 20, maxLng);
  writeDouble(dv, contentOffset + 28, maxLat);
  
  // NumParts
  writeInt32(dv, contentOffset + 36, 1, true);
  // NumPoints
  writeInt32(dv, contentOffset + 40, numPoints, true);
  // Parts array
  writeInt32(dv, contentOffset + 44, 0, true);
  
  // Points array
  let pointOffset = contentOffset + 48;
  vertices.forEach(v => {
    writeDouble(dv, pointOffset, v.lng);
    writeDouble(dv, pointOffset + 8, v.lat);
    pointOffset += 16;
  });

  return buffer;
}

/**
 * Generate .shx file (index file)
 */
function generateShx(vertices: Vertex[]): ArrayBuffer {
  const numPoints = vertices.length;
  const contentLength = 4 + 32 + 4 + 4 + 4 + (16 * numPoints);
  const recordLengthWords = (8 + contentLength) / 2;
  const fileLength = 50 + 4; // 50 words header + 1 record (4 words)

  const buffer = new ArrayBuffer(fileLength * 2);
  const dv = new DataView(buffer);

  // File header (same as .shp)
  writeInt32(dv, 0, 9994, true);
  writeInt32(dv, 24, fileLength, true);
  writeInt32(dv, 28, 1000, true);
  writeInt32(dv, 32, 5, true);

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  vertices.forEach(v => {
    minLng = Math.min(minLng, v.lng);
    maxLng = Math.max(maxLng, v.lng);
    minLat = Math.min(minLat, v.lat);
    maxLat = Math.max(maxLat, v.lat);
  });

  writeDouble(dv, 36, minLng);
  writeDouble(dv, 44, minLat);
  writeDouble(dv, 52, maxLng);
  writeDouble(dv, 60, maxLat);
  writeDouble(dv, 68, 0);
  writeDouble(dv, 76, 0);
  writeDouble(dv, 84, 0);
  writeDouble(dv, 92, 0);

  // Record
  writeInt32(dv, 100, 1, true); // Offset (50 words)
  writeInt32(dv, 104, recordLengthWords, true); // Content length

  return buffer;
}

/**
 * Generate .dbf file (dBASE attribute table)
 */
function generateDbf(fields: ShapefileField[]): ArrayBuffer {
  const numRecords = fields.length;
  
  // Field definitions:
  // id (N, 10, 0), name (C, 40), area_ha (N, 14, 6), crop (C, 20)
  const fieldDefs = [
    { name: 'id', type: 'N', length: 10, decimal: 0 },
    { name: 'name', type: 'C', length: 40, decimal: 0 },
    { name: 'area_ha', type: 'N', length: 14, decimal: 6 },
    { name: 'crop', type: 'C', length: 20, decimal: 0 },
  ];

  const headerLength = 32 + (32 * fieldDefs.length) + 1; // +1 for terminator
  const recordLength = fieldDefs.reduce((sum, f) => sum + f.length, 0) + 1; // +1 for delete flag
  const fileSize = headerLength + (numRecords * recordLength);

  const buffer = new ArrayBuffer(fileSize);
  const dv = new DataView(buffer);
  const encoder = new TextEncoder();

  let offset = 0;

  // Header
  dv.setUint8(offset, 0x03); // dBASE III version
  offset += 1;
  dv.setUint8(offset, new Date().getFullYear() - 1900); // Year
  offset += 1;
  dv.setUint8(offset, new Date().getMonth() + 1); // Month
  offset += 1;
  dv.setUint8(offset, new Date().getDate()); // Day
  offset += 1;
  writeInt32(dv, offset, numRecords, true); // Number of records
  offset += 4;
  writeInt16(dv, offset, headerLength, true); // Header length
  offset += 2;
  writeInt16(dv, offset, recordLength, true); // Record length
  offset += 2;
  // Reserved bytes (20 bytes)
  for (let i = 0; i < 20; i++) {
    dv.setUint8(offset, 0);
    offset += 1;
  }

  // Field descriptors (32 bytes each)
  fieldDefs.forEach(fd => {
    // Field name (11 bytes, null-padded)
    const nameBytes = encoder.encode(fd.name.substring(0, 11));
    for (let i = 0; i < 11; i++) {
      dv.setUint8(offset + i, i < nameBytes.length ? nameBytes[i] : 0);
    }
    offset += 11;
    dv.setUint8(offset, fd.type.charCodeAt(0)); // Field type
    offset += 1;
    for (let i = 0; i < 4; i++) { dv.setUint8(offset, 0); offset += 1; } // Reserved
    dv.setUint8(offset, fd.length); // Field length
    offset += 1;
    dv.setUint8(offset, fd.decimal); // Decimal count
    offset += 1;
    for (let i = 0; i < 14; i++) { dv.setUint8(offset, 0); offset += 1; } // Reserved
  });

  // Header terminator
  dv.setUint8(offset, 0x0D);
  offset += 1;

  // Records
  fields.forEach((field, idx) => {
    dv.setUint8(offset, 0x20); // Space (not deleted)
    offset += 1;

    // id (N, 10)
    const idStr = String(idx + 1).padStart(10, ' ');
    for (let i = 0; i < 10; i++) { dv.setUint8(offset, idStr.charCodeAt(i)); offset += 1; }

    // name (C, 40)
    const nameStr = field.name.substring(0, 40).padEnd(40, ' ');
    for (let i = 0; i < 40; i++) { dv.setUint8(offset, nameStr.charCodeAt(i)); offset += 1; }

    // area_ha (N, 14, 6)
    const areaStr = field.areaHa.toFixed(6).padStart(14, ' ');
    for (let i = 0; i < 14; i++) { dv.setUint8(offset, areaStr.charCodeAt(i)); offset += 1; }

    // crop (C, 20)
    const cropStr = (field.cropType || '').substring(0, 20).padEnd(20, ' ');
    for (let i = 0; i < 20; i++) { dv.setUint8(offset, cropStr.charCodeAt(i)); offset += 1; }
  });

  // EOF marker
  if (offset < fileSize) {
    dv.setUint8(offset, 0x1A);
  }

  return buffer;
}

/**
 * Download all Shapefile components as a ZIP archive
 */
export async function downloadShapefile(
  fieldName: string,
  vertices: Vertex[],
  fields: Array<{ name: string; areaHa: number; cropType?: string }>
): Promise<void> {
  try {
    // Use JSZip if available, otherwise download as individual files
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Generate .shp, .shx, .dbf for each field
    fields.forEach((field, idx) => {
      // Note: In a real scenario, each polygon would be in its own record.
      // For simplicity, we create a multi-patch or use the vertices of the first field.
      if (idx === 0 && vertices.length >= 3) {
        const shpData = generateShp(vertices);
        const shxData = generateShx(vertices);
        zip.file(`${fieldName.replace(/\s+/g, '_')}.shp`, shpData);
        zip.file(`${fieldName.replace(/\s+/g, '_')}.shx`, shxData);
      }
    });

    // Generate .dbf with all field attributes
    const dbfData = generateDbf(fields);
    zip.file(`${fieldName.replace(/\s+/g, '_')}.dbf`, dbfData);

    // Generate .prj (coordinate system - WGS84)
    const prjContent = `GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]`;
    zip.file(`${fieldName.replace(/\s+/g, '_')}.prj`, prjContent);

    // Generate .cpg (code page)
    zip.file(`${fieldName.replace(/\s+/g, '_')}.cpg`, 'UTF-8');

    // Generate the ZIP blob and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fieldName.replace(/\s+/g, '_')}_shapefile.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // Fallback: download as individual files without ZIP
    if (vertices.length >= 3) {
      const shpData = generateShp(vertices);
      downloadBlob(shpData, `${fieldName.replace(/\s+/g, '_')}.shp`, 'application/octet-stream');
      
      const shxData = generateShx(vertices);
      downloadBlob(shxData, `${fieldName.replace(/\s+/g, '_')}.shx`, 'application/octet-stream');
      
      const dbfData = generateDbf(fields);
      downloadBlob(dbfData, `${fieldName.replace(/\s+/g, '_')}.dbf`, 'application/octet-stream');
    }
  }
}

function downloadBlob(data: ArrayBuffer, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { generateShp, generateShx, generateDbf };
