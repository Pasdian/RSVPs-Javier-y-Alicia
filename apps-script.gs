function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data  = JSON.parse(e.postData.contents);

    const headers = [
      'Fecha',
      'Nombre',
      'Email',
      'Teléfono',
      'Asistencia',
      'Acompañante',
      'Restricciones alimentarias',
      'Mensaje'
    ];

    // Write header row on first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    } else {
      // If sheet already has data, check if the Teléfono column header is missing
      // (i.e. the sheet was created before this field was added)
      const firstRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (!firstRow.includes('Teléfono')) {
        // Find where to insert: after Email (column 3), shift existing headers right
        sheet.insertColumnAfter(3);
        sheet.getRange(1, 4).setValue('Teléfono').setFontWeight('bold');
      }
    }

    // Determine column order from header row to place values correctly
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = new Array(headerRow.length).fill('');
    const colIndex = (name) => headerRow.indexOf(name);

    row[colIndex('Fecha')]                    = new Date();
    row[colIndex('Nombre')]                   = data.name      || '';
    row[colIndex('Email')]                    = data.email     || '';
    row[colIndex('Teléfono')]                 = data.phone     || '';
    row[colIndex('Asistencia')]               = data.attend === 'yes' ? 'Asiste' : 'No asiste';
    row[colIndex('Acompañante')]              = data.companion || '';
    row[colIndex('Restricciones alimentarias')] = data.diet   || '';
    row[colIndex('Mensaje')]                  = data.message   || '';

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Used to verify the endpoint is live
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
