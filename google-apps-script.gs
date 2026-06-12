const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const sheetName = data.sheet || 'Registrations';
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    ensureHeaders_(sh, sheetName);
    appendByHeaders_(sh, data);
    return ContentService.createTextOutput(JSON.stringify({status:'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', message:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureHeaders_(sh, sheetName) {
  const map = {
    Registrations: ['Timestamp','Name','Phone','Email','Program','Mode','PackageName','ReferralCode','Location','Message','Status','AssignedBatch','PaymentStatus','DiscountApplied','Notes'],
    TeacherApplications: ['Timestamp','Name','Phone','Email','Subject','TeachingMode','Experience','About','Status','Notes'],
    Referrals: ['Timestamp','ReferrerName','ReferrerPhone','ReferredName','ReferredPhone','PackageName','ReferralCode','DiscountPercent','Status','Notes']
  };
  const headers = map[sheetName] || ['Timestamp','Name','Phone','Email','Message','Status','Notes'];
  if (sh.getLastRow() === 0) sh.appendRow(headers);
}

function appendByHeaders_(sh, data) {
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    if (h === 'Timestamp') return new Date();
    if (h === 'Status') return data.Status || 'New';
    return data[h] || '';
  });
  sh.appendRow(row);
}
