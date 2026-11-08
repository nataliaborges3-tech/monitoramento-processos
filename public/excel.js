// Minimal OOXML workbook, packaged as a standard ZIP with stored entries.
// Inline strings keep user content as text, including values beginning with '='.
const enc = new TextEncoder();
const xml = value => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ -1) >>> 0;
}
export function zipFiles(files) {
  const chunks = [], central = []; let offset = 0, centralSize = 0;
  for (const [name, content] of Object.entries(files)) {
    const filename = enc.encode(name), data = enc.encode(content), crc = crc32(data);
    const header = new Uint8Array(30 + filename.length), view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(12, 33, true);
    view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true); view.setUint16(26, filename.length, true); header.set(filename, 30);
    chunks.push(header, data);
    const c = new Uint8Array(46 + filename.length), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(14, 33, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, filename.length, true); cv.setUint32(42, offset, true); c.set(filename, 46);
    central.push(c); centralSize += c.length; offset += header.length + data.length;
  }
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, central.length, true); ev.setUint16(10, central.length, true); ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
function sheet(rows) {
  const cols = rows[0].map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="30" customWidth="1"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${rows.map((row, i) => `<row r="${i + 1}">${row.map(value => `<c t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`).join('')}</row>`).join('')}</sheetData><autoFilter ref="A1:${String.fromCharCode(64 + rows[0].length)}${rows.length}"/></worksheet>`;
}
export function makeWorkbook(processes) {
  const rows = [['Número SEI', 'Assunto', 'Unidade solicitante', 'Unidade atual', 'Responsável', 'Prazo', 'Situação', 'Resumo', 'Pendências', 'Próximos encaminhamentos'], ...processes.map(p => [p.sei, p.subject, p.requester, p.unit, p.owner, p.deadline, p.status, p.summary, p.pending, p.next])];
  const history = [['Número SEI', 'Unidade', 'Entrada', 'Saída', 'Observação'], ...processes.flatMap(p => p.history.map((h, i) => [p.sei, h.unit, h.enteredAt, p.history[i + 1]?.enteredAt || (p.status === 'Concluído' ? 'Concluído' : 'Unidade atual'), h.note]))];
  return zipFiles({
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Processos" sheetId="1" r:id="rId1"/><sheet name="Tramitações" sheetId="2" r:id="rId2"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': sheet(rows), 'xl/worksheets/sheet2.xml': sheet(history)
  });
}
