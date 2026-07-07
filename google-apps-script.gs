/**
 * Pranavam Academy Backend - Stable Version with Corporate Chair Yoga Form, Reports, Print and Clear Tools
 * Works as a Google Sheets bound script without entering Spreadsheet ID.
 * If you use it as a standalone Apps Script project, paste your Sheet ID below.
 */
const SPREADSHEET_ID = ''; // Optional. Leave blank if script is opened from the Google Sheet.
const REPORT_FOLDER_NAME = 'Pranavam Academy Reports';

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  const reportsMenu = ui.createMenu('Reports & Sheets')
    .addItem('Create All Reports', 'createAllReports')
    .addSeparator()
    .addItem('Create Dashboard Report', 'createDashboardReport')
    .addItem('Create Registration Report', 'createRegistrationReport')
    .addItem('Create Teacher Applications Report', 'createTeacherApplicationsReport')
    .addItem('Create Corporate Leads Report', 'createCorporateLeadsReport')
    .addItem('Create Corporate Registrations Report', 'createCorporateRegistrationsReport')
    .addItem('Create Referral Report', 'createReferralReport')
    .addItem('Create Payment Report', 'createPaymentReport')
    .addSeparator()
    .addItem('Create Daily Class Sheet', 'createDailyClassSheet')
    .addItem('Create Monthly Summary', 'createMonthlySummaryReport');

  const printMenu = ui.createMenu('Print / Export')
    .addItem('Export All Reports as PDF', 'exportAllReportsAsPdf')
    .addItem('Export Active Sheet as PDF', 'exportActiveSheetAsPdf')
    .addItem('Open Print Instructions', 'openPrintInstructions');

  const clearMenu = ui.createMenu('Clear / Reset')
    .addItem('Clear Report Sheets Only', 'clearReportSheetsOnly')
    .addItem('Clear Daily Class Sheets Only', 'clearDailyClassSheetsOnly')
    .addItem('Clear All Generated Reports & Sheets', 'clearAllGeneratedReportsAndSheets')
    .addSeparator()
    .addItem('Clear Form Data - Danger', 'clearFormDataDanger');

  ui.createMenu('Pranavam Backend')
    .addItem('Setup / Repair Sheets', 'setupPranavamAcademySheets')
    .addItem('Update Corporate Chair Yoga Packages', 'updateCorporateChairYogaPackages')
    .addSubMenu(reportsMenu)
    .addSubMenu(printMenu)
    .addSubMenu(clearMenu)
    .addSeparator()
    .addItem('Seed Default Site Images', 'seedSiteImages_')
    .addItem('Seed Default Slider Banners', 'seedSliderBanners_')
    .addItem('Backend Test', 'backendTest')
    .addToUi();
}

function backendTest() {
  const ss = getSpreadsheet_();
  SpreadsheetApp.getUi().alert('Backend working. Connected sheet: ' + ss.getName());
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  try {
    const action = String(params.action || 'ping').trim();
    let result;

    if (action === 'setup') {
      setupPranavamAcademySheets();
      result = { ok: true, status: 'success', message: 'Sheets setup completed.' };
      return webOutput_(result, params);
    }

    if (action === 'siteImages') {
      result = { ok: true, status: 'success', data: getActiveSheetObjects_('SiteImages') };
      return webOutput_(result, params);
    }

    if (action === 'sliderBanners') {
      const page = String(params.page || 'home').toLowerCase();
      const rows = getActiveSheetObjects_('SliderBanners')
        .filter(row => {
          const rowPage = String(row.Page || 'home').toLowerCase();
          return rowPage === page || rowPage === 'all';
        })
        .sort((a, b) => Number(a.SortOrder || 999) - Number(b.SortOrder || 999));
      result = { ok: true, status: 'success', data: rows };
      return webOutput_(result, params);
    }

    if (action === 'packages') {
      result = { ok: true, status: 'success', data: getActiveSheetObjects_('Packages') };
      return webOutput_(result, params);
    }

    result = {
      ok: true,
      status: 'success',
      message: 'Pranavam Academy backend is reachable.',
      actions: ['siteImages', 'sliderBanners', 'packages', 'setup']
    };
    return webOutput_(result, params);
  } catch (err) {
    return webOutput_({ ok: false, status: 'error', message: cleanError_(err) }, params);
  }
}


function doPost(e) {
  try {
    const data = parsePostData_(e);
    const sheetName = sanitizeSheetName_(data.sheet || data.Sheet || data.formType || 'Registrations');
    const ss = getSpreadsheet_();
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    ensureHeaders_(sh, sheetName);
    appendByHeaders_(sh, data);
    return jsonOutput_({ ok: true, status: 'success', message: 'Submitted successfully.' });
  } catch (err) {
    return jsonOutput_({ ok: false, status: 'error', message: cleanError_(err) });
  }
}

function setupPranavamAcademySheets() {
  const ss = getSpreadsheet_();
  Object.keys(headerMap_()).forEach(name => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    ensureHeaders_(sh, name);
  });
  seedPackages_();
  seedSiteImages_();
  seedSliderBanners_();
  SpreadsheetApp.flush();
  return 'Setup completed';
}

function getSpreadsheet_() {
  const id = String(SPREADSHEET_ID || '').trim();
  if (id && id !== 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE') {
    return SpreadsheetApp.openById(id);
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  throw new Error('Spreadsheet not found. Open Apps Script from the Google Sheet, or paste the Sheet ID in SPREADSHEET_ID.');
}

function parsePostData_(e) {
  if (!e || !e.postData) {
    throw new Error('No POST data received. Do not run doPost directly from the editor. Test by submitting the website form or use doGet?action=ping.');
  }

  const raw = e.postData.contents || '';
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (jsonErr) {
    const obj = {};
    raw.split('&').forEach(pair => {
      const parts = pair.split('=');
      if (!parts[0]) return;
      const key = decodeURIComponent(parts[0].replace(/\+/g, ' '));
      const value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
      obj[key] = value;
    });
    return obj;
  }
}

function sanitizeSheetName_(name) {
  const allowed = Object.keys(headerMap_());
  const clean = String(name || '').replace(/[\\/?*\[\]:]/g, '').trim();
  if (allowed.indexOf(clean) !== -1) return clean;
  const lower = clean.toLowerCase();
  if (lower.includes('teacher')) return 'TeacherApplications';
  if (lower.includes('refer')) return 'Referrals';
  if (lower.includes('corporate')) return 'CorporateLeads';
  if (lower.includes('payment')) return 'Payments';
  if (lower.includes('attendance')) return 'Attendance';
  return 'Registrations';
}

function headerMap_() {
  return {
    Registrations: ['Timestamp','Name','Phone','Email','Program','Mode','PackageName','ReferralCode','Location','Message','Status','AssignedBatch','PaymentStatus','DiscountApplied','Notes'],
    TeacherApplications: ['Timestamp','Name','Phone','Email','Subject','TeachingMode','Experience','About','Status','Notes'],
    CorporateLeads: ['Timestamp','CompanyName','ContactPerson','Phone','Email','CityCountry','CompanySize','Program','PackageID','PackageName','PackageFee','PackageDuration','PackageFrequency','PackageSessions','Mode','Category','PreferredSessionType','PreferredTime','Frequency','PreferredSchedule','Requirement','Message','Page','Status','Notes'],
    CorporateRegistrations: ['Timestamp','CompanyName','ContactPerson','Phone','Email','CityCountry','BillingAddress','GSTNumber','CompanySize','Program','PackageID','PackageName','PackageFee','PackageDuration','PackageFrequency','PackageSessions','Mode','Category','ExpectedStartDate','PreferredTime','PreferredSchedule','OnlinePlatform','PaymentMode','TrialCompleted','Requirement','Message','Page','Status','Notes'],
    Referrals: ['Timestamp','ReferrerName','ReferrerPhone','ReferredName','ReferredPhone','PackageName','ReferralCode','DiscountPercent','Status','Notes'],
    Payments: ['PaymentID','Timestamp','Name','Phone','Email','Program','PackageName','Amount','PaymentMode','TransactionID','PaymentStatus','PaymentDate','Notes'],
    Attendance: ['Date','Program','Mode','BatchName','StudentName','Phone','AttendanceStatus','Remarks'],
    TeacherAttendance: ['Date','TeacherName','Subject','Mode','ClassTime','AttendanceStatus','Remarks'],
    ClassSchedule: ['ScheduleID','Program','Mode','BatchName','TeacherName','Day','StartTime','EndTime','Location','Status','Notes'],
    Packages: ['PackageID','Mode','Category','PackageName','Price','Duration','Frequency','Sessions','ClassTime','Location','Features','Description','ReferralDiscount','TrialAvailable','Status'],
    SiteImages: ['ImageKey','SectionName','ImageURL','AltText','Status','Notes'],
    SliderBanners: ['BannerID','Page','SortOrder','Badge','Title','Subtitle','ImageURL','AltText','ButtonText','ButtonLink','SecondaryButtonText','SecondaryButtonLink','Status','Notes'],
    Settings: ['Key','Value','Notes']
  };
}

function ensureHeaders_(sh, sheetName) {
  const headers = headerMap_()[sheetName] || ['Timestamp','Name','Phone','Email','Message','Status','Notes'];

  if (sh.getLastRow() === 0 || sh.getLastColumn() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeader_(sh, headers.length);
    return;
  }

  const lastColumn = Math.max(sh.getLastColumn(), 1);
  const current = sh.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
  const missing = headers.filter(h => current.indexOf(h) === -1);
  if (missing.length) {
    sh.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
  }
  styleHeader_(sh, sh.getLastColumn());
}

function styleHeader_(sh, columns) {
  if (!columns) columns = sh.getLastColumn();
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, columns)
    .setFontWeight('bold')
    .setBackground('#0f5132')
    .setFontColor('#ffffff');
  sh.autoResizeColumns(1, columns);
}

function appendByHeaders_(sh, data) {
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    if (h === 'Timestamp') return new Date();
    if (h === 'Status') return data.Status || data.status || 'New';
    return data[h] || data[h.replace(/\s+/g, '')] || '';
  });
  sh.appendRow(row);
}

function getActiveSheetObjects_(sheetName) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getDataRange().getDisplayValues();
  const headers = values.shift().map(h => String(h).trim());

  return values.map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).filter(obj => String(obj.Status || 'Active').toLowerCase() === 'active');
}

function getSheetObjects_(sheetName) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getDisplayValues();
  const headers = values.shift().map(h => String(h).trim());
  return values.map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function seedPackages_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('Packages') || ss.insertSheet('Packages');
  ensureHeaders_(sh, 'Packages');
  const rows = defaultPackages_();

  if (sh.getLastRow() < 2) {
    sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    archiveLegacyCorporateChairYogaPackages_(sh);
    return;
  }

  const existingIds = new Set(sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().map(r => String(r[0]).trim()).filter(Boolean));
  const missingRows = rows.filter(r => !existingIds.has(String(r[0]).trim()));
  if (missingRows.length) {
    sh.getRange(sh.getLastRow() + 1, 1, missingRows.length, missingRows[0].length).setValues(missingRows);
  }
  archiveLegacyCorporateChairYogaPackages_(sh);
}

function updateCorporateChairYogaPackages() {
  seedPackages_();
  SpreadsheetApp.getUi().alert('Corporate Chair Yoga package options updated. Old small/medium/large rows have been marked Inactive and new 1, 3, 6 and 12 month rows have been added if missing.');
}

function archiveLegacyCorporateChairYogaPackages_(sh) {
  ensureHeaders_(sh, 'Packages');
  if (sh.getLastRow() < 2) return;

  const values = sh.getDataRange().getDisplayValues();
  const headers = values[0].map(h => String(h).trim());
  const idCol = headers.indexOf('PackageID') + 1;
  const nameCol = headers.indexOf('PackageName') + 1;
  const statusCol = headers.indexOf('Status') + 1;
  if (!idCol || !nameCol || !statusCol) return;

  const legacyIds = ['PKG002','PKG007','PKG008','PKG009','PKG010'];
  const legacyNames = ['online corporate chair yoga class','corporate chair yoga - small team','corporate chair yoga - medium team','corporate chair yoga - large team'];
  for (let r = 2; r <= sh.getLastRow(); r++) {
    const packageId = String(sh.getRange(r, idCol).getDisplayValue()).trim();
    const packageName = String(sh.getRange(r, nameCol).getDisplayValue()).trim().toLowerCase();
    if (legacyIds.indexOf(packageId) !== -1 || legacyNames.indexOf(packageName) !== -1) {
      sh.getRange(r, statusCol).setValue('Inactive');
    }
  }
}

function seedSiteImages_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('SiteImages') || ss.insertSheet('SiteImages');
  ensureHeaders_(sh, 'SiteImages');
  if (sh.getLastRow() > 1) return;
  const rows = defaultSiteImages_();
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function seedSliderBanners_() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('SliderBanners') || ss.insertSheet('SliderBanners');
  ensureHeaders_(sh, 'SliderBanners');
  if (sh.getLastRow() > 1) return;
  const rows = defaultSliderBanners_();
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/* ===============================
   REPORT AND SHEET CREATION TOOLS
   =============================== */

function createAllReports(showAlert) {
  showAlert = showAlert !== false;
  setupPranavamAcademySheets();
  createDashboardReport(false);
  createRegistrationReport(false);
  createTeacherApplicationsReport(false);
  createCorporateLeadsReport(false);
  createCorporateRegistrationsReport(false);
  createReferralReport(false);
  createPaymentReport(false);
  createDailyClassSheet(false);
  createMonthlySummaryReport(false);
  if (showAlert) SpreadsheetApp.getUi().alert('Reports and generated sheets have been created / refreshed.');
}

function createDashboardReport(showAlert) {
  showAlert = showAlert !== false;
  const regs = getSheetObjects_('Registrations');
  const teachers = getSheetObjects_('TeacherApplications');
  const corporate = getSheetObjects_('CorporateLeads');
  const corporateRegs = getSheetObjects_('CorporateRegistrations');
  const referrals = getSheetObjects_('Referrals');
  const payments = getSheetObjects_('Payments');
  const packagesRows = getActiveSheetObjects_('Packages');
  const images = getActiveSheetObjects_('SiteImages');
  const banners = getActiveSheetObjects_('SliderBanners');

  const paidRows = payments.filter(r => String(r.PaymentStatus || '').toLowerCase() === 'paid');
  const pendingRows = payments.filter(r => String(r.PaymentStatus || '').toLowerCase() !== 'paid');

  const rows = [
    ['Generated On', formatDateTime_(new Date()), 'Latest backend dashboard refresh'],
    ['Total Registrations', regs.length, 'All rows in Registrations'],
    ['New Registrations', countByStatus_(regs, 'New'), 'Status = New'],
    ['Teacher Applications', teachers.length, 'All teacher applications'],
    ['Corporate Leads', corporate.length, 'All corporate inquiry rows'],
    ['Corporate Registrations', corporateRegs.length, 'All confirmed corporate registration rows'],
    ['Referrals', referrals.length, 'All referral rows'],
    ['Payment Rows', payments.length, 'All payment records'],
    ['Paid Payments', paidRows.length, 'PaymentStatus = Paid'],
    ['Pending / Other Payments', pendingRows.length, 'PaymentStatus not marked Paid'],
    ['Total Paid Amount', sumAmount_(paidRows, 'Amount'), 'Sum of paid payment amount'],
    ['Active Packages', packagesRows.length, 'Status = Active'],
    ['Active Site Images', images.length, 'Status = Active'],
    ['Active Slider Banners', banners.length, 'Status = Active']
  ];

  writeReportSheet_('Report_Dashboard', ['Metric','Value','Notes'], rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Dashboard report created.');
}

function createRegistrationReport(showAlert) {
  showAlert = showAlert !== false;
  const headers = ['Timestamp','Name','Phone','Email','Program','Mode','PackageName','ReferralCode','Location','Status','PaymentStatus','AssignedBatch','Message','Notes'];
  const rows = mapRows_(getSheetObjects_('Registrations'), headers);
  writeReportSheet_('Report_Registrations', headers, rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Registration report created.');
}

function createTeacherApplicationsReport(showAlert) {
  showAlert = showAlert !== false;
  const headers = ['Timestamp','Name','Phone','Email','Subject','TeachingMode','Experience','Status','About','Notes'];
  const rows = mapRows_(getSheetObjects_('TeacherApplications'), headers);
  writeReportSheet_('Report_Teachers', headers, rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Teacher applications report created.');
}

function createCorporateLeadsReport(showAlert) {
  showAlert = showAlert !== false;
  const headers = ['Timestamp','CompanyName','ContactPerson','Phone','Email','CityCountry','CompanySize','Program','PackageID','PackageName','PackageFee','PackageDuration','PackageFrequency','PackageSessions','Mode','Category','PreferredSessionType','PreferredTime','Frequency','PreferredSchedule','Requirement','Status','Notes'];
  const rows = mapRows_(getSheetObjects_('CorporateLeads'), headers);
  writeReportSheet_('Report_Corporate_Leads', headers, rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Corporate leads report created.');
}


function createCorporateRegistrationsReport(showAlert) {
  showAlert = showAlert !== false;
  const headers = ['Timestamp','CompanyName','ContactPerson','Phone','Email','CityCountry','BillingAddress','GSTNumber','CompanySize','Program','PackageID','PackageName','PackageFee','PackageDuration','PackageFrequency','PackageSessions','Mode','Category','ExpectedStartDate','PreferredTime','PreferredSchedule','OnlinePlatform','PaymentMode','TrialCompleted','Requirement','Status','Notes'];
  const rows = mapRows_(getSheetObjects_('CorporateRegistrations'), headers);
  writeReportSheet_('Report_Corporate_Registrations', headers, rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Corporate registrations report created.');
}

function createReferralReport(showAlert) {
  showAlert = showAlert !== false;
  const headers = ['Timestamp','ReferrerName','ReferrerPhone','ReferredName','ReferredPhone','PackageName','ReferralCode','DiscountPercent','Status','Notes'];
  const rows = mapRows_(getSheetObjects_('Referrals'), headers);
  writeReportSheet_('Report_Referrals', headers, rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Referral report created.');
}

function createPaymentReport(showAlert) {
  showAlert = showAlert !== false;
  const headers = ['PaymentID','Timestamp','Name','Phone','Email','Program','PackageName','Amount','PaymentMode','TransactionID','PaymentStatus','PaymentDate','Notes'];
  const rows = mapRows_(getSheetObjects_('Payments'), headers);
  writeReportSheet_('Report_Payments', headers, rows);

  const sh = getSpreadsheet_().getSheetByName('Report_Payments');
  const last = sh.getLastRow() + 2;
  const paidRows = getSheetObjects_('Payments').filter(r => String(r.PaymentStatus || '').toLowerCase() === 'paid');
  sh.getRange(last, 1, 3, 2).setValues([
    ['Total Payment Rows', rows.length],
    ['Paid Payment Rows', paidRows.length],
    ['Total Paid Amount', sumAmount_(paidRows, 'Amount')]
  ]);
  sh.getRange(last, 1, 3, 1).setFontWeight('bold');
  if (showAlert) SpreadsheetApp.getUi().alert('Payment report created.');
}

function createDailyClassSheet(showAlert) {
  showAlert = showAlert !== false;
  setupPranavamAcademySheets();

  const today = new Date();
  const sheetName = 'DailySheet_' + Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyyMMdd');
  const registrations = getSheetObjects_('Registrations');
  const schedule = getActiveSheetObjects_('ClassSchedule');
  const headers = ['Date','Program','Mode','BatchName','TeacherName','ClassTime','Location','StudentName','Phone','Attendance','Remarks'];
  let rows = [];

  if (registrations.length) {
    rows = registrations.map(r => [
      formatDateOnly_(today),
      r.Program || '',
      r.Mode || '',
      r.AssignedBatch || '',
      '',
      '',
      r.Location || '',
      r.Name || '',
      r.Phone || '',
      '',
      ''
    ]);
  } else if (schedule.length) {
    rows = schedule.map(s => [
      formatDateOnly_(today),
      s.Program || '',
      s.Mode || '',
      s.BatchName || '',
      s.TeacherName || '',
      String(s.StartTime || '') + (s.EndTime ? ' - ' + s.EndTime : ''),
      s.Location || '',
      '',
      '',
      '',
      ''
    ]);
  }

  writeReportSheet_(sheetName, headers, rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Daily class sheet created: ' + sheetName);
}

function createMonthlySummaryReport(showAlert) {
  showAlert = showAlert !== false;
  const now = new Date();
  const monthLabel = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM');

  const regs = filterRowsByCurrentMonth_(getSheetObjects_('Registrations'), 'Timestamp');
  const teachers = filterRowsByCurrentMonth_(getSheetObjects_('TeacherApplications'), 'Timestamp');
  const corporate = filterRowsByCurrentMonth_(getSheetObjects_('CorporateLeads'), 'Timestamp');
  const corporateRegs = filterRowsByCurrentMonth_(getSheetObjects_('CorporateRegistrations'), 'Timestamp');
  const referrals = filterRowsByCurrentMonth_(getSheetObjects_('Referrals'), 'Timestamp');
  const payments = filterRowsByCurrentMonth_(getSheetObjects_('Payments'), 'Timestamp');
  const paidRows = payments.filter(r => String(r.PaymentStatus || '').toLowerCase() === 'paid');

  const rows = [
    ['Month', monthLabel, 'Current month summary'],
    ['Registrations This Month', regs.length, 'Based on Timestamp'],
    ['Teacher Applications This Month', teachers.length, 'Based on Timestamp'],
    ['Corporate Leads This Month', corporate.length, 'Based on Timestamp'],
    ['Corporate Registrations This Month', corporateRegs.length, 'Based on Timestamp'],
    ['Referrals This Month', referrals.length, 'Based on Timestamp'],
    ['Payment Rows This Month', payments.length, 'Based on Timestamp'],
    ['Paid Payments This Month', paidRows.length, 'PaymentStatus = Paid'],
    ['Paid Amount This Month', sumAmount_(paidRows, 'Amount'), 'Sum of paid payments']
  ];

  writeReportSheet_('Report_Monthly_Summary', ['Metric','Value','Notes'], rows);
  if (showAlert) SpreadsheetApp.getUi().alert('Monthly summary report created.');
}

function writeReportSheet_(sheetName, headers, rows) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (!rows || !rows.length) {
    const blank = headers.map((h, i) => i === 0 ? 'No data found' : '');
    sh.getRange(2, 1, 1, headers.length).setValues([blank]);
  } else {
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0f5132')
    .setFontColor('#ffffff');
  sh.getDataRange().setWrap(true).setVerticalAlignment('middle');
  sh.autoResizeColumns(1, headers.length);
  sh.activate();
}

function mapRows_(objects, headers) {
  return objects.map(obj => headers.map(h => obj[h] || ''));
}

function countByStatus_(rows, status) {
  const target = String(status || '').toLowerCase();
  return rows.filter(r => String(r.Status || '').toLowerCase() === target).length;
}

function sumAmount_(rows, field) {
  return rows.reduce((total, row) => {
    const clean = String(row[field] || '0').replace(/[^0-9.-]/g, '');
    const num = Number(clean || 0);
    return total + (isNaN(num) ? 0 : num);
  }, 0);
}

function filterRowsByCurrentMonth_(rows, dateField) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return rows.filter(row => {
    const d = parseLooseDate_(row[dateField]);
    return d && d.getFullYear() === y && d.getMonth() === m;
  });
}

function parseLooseDate_(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateOnly_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function formatDateTime_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/* ===============================
   PRINT / PDF EXPORT TOOLS
   =============================== */

function exportAllReportsAsPdf() {
  createAllReports(false);
  const ss = getSpreadsheet_();
  const sheets = ss.getSheets().filter(sh => isGeneratedReportSheet_(sh.getName()));
  if (!sheets.length) {
    SpreadsheetApp.getUi().alert('No report sheets found to export.');
    return;
  }

  const folder = getOrCreateReportFolder_();
  const links = sheets.map(sh => exportSheetAsPdf_(sh, folder));
  showLinksDialog_('Pranavam Report PDFs Created', links);
}

function exportActiveSheetAsPdf() {
  const ss = getSpreadsheet_();
  const sh = ss.getActiveSheet();
  const folder = getOrCreateReportFolder_();
  const link = exportSheetAsPdf_(sh, folder);
  showLinksDialog_('PDF Created', [link]);
}

function exportSheetAsPdf_(sh, folder) {
  const ss = getSpreadsheet_();
  const exportUrl = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export'
    + '?format=pdf'
    + '&gid=' + sh.getSheetId()
    + '&size=A4'
    + '&portrait=false'
    + '&fitw=true'
    + '&sheetnames=false'
    + '&printtitle=false'
    + '&pagenumbers=true'
    + '&gridlines=false'
    + '&fzr=true';

  const token = ScriptApp.getOAuthToken();
  const response = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('PDF export failed for ' + sh.getName() + '. Response code: ' + code);
  }

  const fileName = sh.getName() + '_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.pdf';
  const blob = response.getBlob().setName(fileName);
  const file = folder.createFile(blob);
  return { name: fileName, url: file.getUrl() };
}

function getOrCreateReportFolder_() {
  const folders = DriveApp.getFoldersByName(REPORT_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(REPORT_FOLDER_NAME);
}

function showLinksDialog_(title, links) {
  const html = ['<div style="font-family:Arial,sans-serif;padding:16px;line-height:1.5">'];
  html.push('<h3 style="margin-top:0">' + escapeHtml_(title) + '</h3>');
  html.push('<p>Open each PDF link and use browser print or download.</p>');
  html.push('<ol>');
  links.forEach(link => {
    html.push('<li><a target="_blank" href="' + escapeHtml_(link.url) + '">' + escapeHtml_(link.name) + '</a></li>');
  });
  html.push('</ol></div>');
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html.join('')).setWidth(520).setHeight(360), title);
}

function openPrintInstructions() {
  const html = '<div style="font-family:Arial,sans-serif;padding:16px;line-height:1.5">'
    + '<h3 style="margin-top:0">Print Instructions</h3>'
    + '<p>Use <b>Pranavam Backend → Reports & Sheets</b> to create the required report first.</p>'
    + '<p>Then use <b>Pranavam Backend → Print / Export → Export All Reports as PDF</b>.</p>'
    + '<p>The PDFs will be saved in Google Drive inside the folder <b>' + REPORT_FOLDER_NAME + '</b>.</p>'
    + '<p>You can open the PDF links and print from your browser.</p>'
    + '</div>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(500).setHeight(300), 'Print Instructions');
}

/* ===============================
   CLEAR / RESET TOOLS
   =============================== */

function clearReportSheetsOnly() {
  if (!confirmText_('Type CLEAR REPORTS to delete generated report sheets.', 'CLEAR REPORTS')) return;
  const count = deleteGeneratedSheets_(name => isGeneratedReportSheet_(name));
  SpreadsheetApp.getUi().alert(count + ' report sheet(s) cleared.');
}

function clearDailyClassSheetsOnly() {
  if (!confirmText_('Type CLEAR DAILY to delete generated daily class sheets.', 'CLEAR DAILY')) return;
  const count = deleteGeneratedSheets_(name => name.indexOf('DailySheet_') === 0);
  SpreadsheetApp.getUi().alert(count + ' daily class sheet(s) cleared.');
}

function clearAllGeneratedReportsAndSheets() {
  if (!confirmText_('Type CLEAR GENERATED to delete all generated report and daily class sheets.', 'CLEAR GENERATED')) return;
  const count = deleteGeneratedSheets_(name => isGeneratedReportSheet_(name) || name.indexOf('DailySheet_') === 0);
  SpreadsheetApp.getUi().alert(count + ' generated sheet(s) cleared. Master data sheets were not touched.');
}

function clearFormDataDanger() {
  const msg = 'This will clear submitted data from Registrations, TeacherApplications, CorporateLeads, CorporateRegistrations, Referrals, Payments, Attendance and TeacherAttendance. Headers will remain. Type DELETE DATA to continue.';
  if (!confirmText_(msg, 'DELETE DATA')) return;

  const sheets = ['Registrations','TeacherApplications','CorporateLeads','CorporateRegistrations','Referrals','Payments','Attendance','TeacherAttendance'];
  const ss = getSpreadsheet_();
  let cleared = 0;
  sheets.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (sh && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
      cleared++;
    }
  });
  SpreadsheetApp.getUi().alert('Form data cleared from ' + cleared + ' sheet(s). Headers were kept.');
}

function confirmText_(message, requiredText) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Confirmation Required', message, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return false;
  return String(response.getResponseText() || '').trim() === requiredText;
}

function deleteGeneratedSheets_(predicate) {
  const ss = getSpreadsheet_();
  const sheets = ss.getSheets();
  let count = 0;
  sheets.forEach(sh => {
    const name = sh.getName();
    if (!predicate(name)) return;
    if (ss.getSheets().length <= 1) {
      sh.clear();
    } else {
      ss.deleteSheet(sh);
    }
    count++;
  });
  return count;
}

function isGeneratedReportSheet_(name) {
  return name.indexOf('Report_') === 0;
}

function escapeHtml_(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ===============================
   DEFAULT DATA
   =============================== */

function defaultPackages_() {
  return [
    ["PKG001","Online","Yoga","Online Group Yoga - Free Trial","Free","1 Month","5 days/week","Up to 20 live sessions","Morning / Evening Batch","Online","Beginner friendly|Live guided practice|Breathing and relaxation|Donation-based continuation","One-month free online group yoga trial for new students.","Not applicable","Yes","Active"],
    ["PKG002","Online","Yoga","Online Group Yoga - Donation Based","Voluntary Donation","Monthly","5 days/week","Up to 20 live sessions","Morning / Evening Batch","Online","No compulsory fee|Students may contribute any amount|Part of revenue supports charity and yoga promotion","Accessible online group yoga with voluntary contribution only.","Not applicable","Yes","Active"],
    ["PKG003","Online","Yoga","Online Therapeutic Yoga - Basic","₹2,500 / $35","Monthly","2 days/week","8 live sessions","By appointment","Online","Gentle asanas|Breathing practice|Relaxation|Individual attention","Gentle therapeutic yoga support for flexibility, stress relief and wellbeing.","5% for referred student","No","Active"],
    ["PKG004","Online","Yoga","Online Therapeutic Yoga - Standard","₹4,000 / $55","Monthly","3 days/week","12 live sessions","By appointment","Online","Personalized practice|Posture support|Relaxation|Progress guidance","Standard therapeutic yoga plan with more frequent guidance.","5% for referred student","No","Active"],
    ["PKG005","Online","Yoga","Online Therapeutic Yoga - 3 Months","₹10,800 / $150","3 Months","3 days/week","36 live sessions","By appointment","Online","Personalized practice|Progress review|Breathing and relaxation|Consistency support","Three-month therapeutic yoga package with discounted fee.","7% for referred student","No","Active"],
    ["PKG006","Online","Yoga","Online Therapeutic Yoga - 6 Months","₹20,400 / $285","6 Months","3 days/week","72 live sessions","By appointment","Online","Personalized practice|Progress review|Breathing and relaxation|Long-term support","Six-month therapeutic yoga package for steady progress.","10% for referred student","No","Active"],
    ["PKG-CORP-TRIAL","Online","Corporate Chair Yoga","Corporate Chair Yoga - Free Trial","Free","1 Month","Flexible","15-minute online trial sessions","Office-friendly timing","Online","Free trial for companies|15-minute chair yoga|Stress relief|No costume change needed|Employee wellness","Free one-month corporate chair yoga trial for companies and teams.","Not applicable","Yes","Active"],
    ["PKG-CORP-001","Online","Corporate Chair Yoga","Corporate Chair Yoga - 1 Month","₹7,500 / $99","1 Month","5 days/week","20 short sessions","Before work / Lunch / Evening","Online","Up to 50 employees|15-minute sessions|Desk-friendly stretches|Breathing and focus|Monthly wellness start","One-month online chair yoga package for companies starting employee wellness sessions.","5% for referred company","Yes","Active"],
    ["PKG-CORP-003","Online","Corporate Chair Yoga","Corporate Chair Yoga - 3 Months","₹21,000 / $279","3 Months","5 days/week","60 short sessions","Before work / Lunch / Evening","Online","Up to 50 employees|15-minute sessions|Stress relief|Posture support|Quarterly consistency plan","Three-month online chair yoga package for consistent employee wellness practice.","7% for referred company","Yes","Active"],
    ["PKG-CORP-006","Online","Corporate Chair Yoga","Corporate Chair Yoga - 6 Months","₹39,000 / $499","6 Months","5 days/week","120 short sessions","Before work / Lunch / Evening","Online","Up to 50 employees|15-minute sessions|Breathing and stretching|Monthly progress review|Long-term wellness support","Six-month online chair yoga package for companies planning a sustained wellness program.","10% for referred company","Yes","Active"],
    ["PKG-CORP-012","Online","Corporate Chair Yoga","Corporate Chair Yoga - 12 Months","₹72,000 / $899","12 Months","5 days/week","240 short sessions","Before work / Lunch / Evening","Online","Up to 50 employees|15-minute sessions|Annual employee wellness plan|Priority scheduling|Best value package","Annual online chair yoga package for companies that want a full-year employee wellness routine.","10% for referred company","Yes","Active"],
    ["PKG011","Online","Karate","Online Karate - Monthly","₹1,200 / $20","Monthly","2 days/week","8 live sessions","Evening Batch","Online","Basics and stances|Fitness drills|Discipline|Confidence building","Online karate training for beginners and regular students.","5% for referred student","Trial class","Active"],
    ["PKG012","Online","Karate","Online Karate - 3 Months","₹3,300 / $55","3 Months","2 days/week","24 live sessions","Evening Batch","Online","Basics and stances|Fitness drills|Discipline|Confidence building","Three-month online karate package with discounted fee.","7% for referred student","Trial class","Active"],
    ["PKG013","Online","Karate","Online Karate - 6 Months","₹6,000 / $100","6 Months","2 days/week","48 live sessions","Evening Batch","Online","Basics and stances|Fitness drills|Discipline|Confidence building","Six-month online karate package for continuous training.","10% for referred student","Trial class","Active"],
    ["PKG014","Online","Karate","Online Karate - 12 Months","₹11,000 / $180","12 Months","2 days/week","96 live sessions","Evening Batch","Online","Basics and stances|Fitness drills|Discipline|Confidence building","Annual online karate package with maximum savings.","10% for referred student","Trial class","Active"],
    ["PKG015","Online","Dance","Online Dance - Monthly","₹1,200 / $20","Monthly","2 days/week","8 live sessions","Evening / Weekend Batch","Online","Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Online dance class for rhythm, movement and confidence.","5% for referred student","Trial class","Active"],
    ["PKG016","Online","Dance","Online Dance - 3 Months","₹3,300 / $55","3 Months","2 days/week","24 live sessions","Evening / Weekend Batch","Online","Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Three-month online dance package with discounted fee.","7% for referred student","Trial class","Active"],
    ["PKG017","Online","Dance","Online Dance - 6 Months","₹6,000 / $100","6 Months","2 days/week","48 live sessions","Evening / Weekend Batch","Online","Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Six-month online dance package for steady learning.","10% for referred student","Trial class","Active"],
    ["PKG018","Online","Dance","Online Dance - 12 Months","₹11,000 / $180","12 Months","2 days/week","96 live sessions","Evening / Weekend Batch","Online","Step-by-step learning|Rhythm and movement|Beginner friendly|Practice support","Annual online dance package with maximum savings.","10% for referred student","Trial class","Active"],
    ["PKG019","Online","Music","Online Music - Group Monthly","₹1,500 / $25","Monthly","2 days/week","8 live sessions","Evening / Weekend Batch","Online","Voice or instrument guidance|Basic theory|Practice support|Beginner friendly","Online group music class for beginners and regular learners.","5% for referred student","Trial class","Active"],
    ["PKG020","Online","Music","Online Music - Individual Monthly","₹3,000 / $45","Monthly","1 day/week","4 personal sessions","By appointment","Online","One-to-one guidance|Personal practice plan|Voice or instrument support|Progress feedback","Individual online music coaching package.","5% for referred student","Trial class","Active"],
    ["PKG021","Online","Music","Online Music - 3 Months Group","₹4,200 / $70","3 Months","2 days/week","24 live sessions","Evening / Weekend Batch","Online","Voice or instrument guidance|Basic theory|Practice support|Beginner friendly","Three-month online group music package.","7% for referred student","Trial class","Active"],
    ["PKG022","Online","Music","Online Music - 6 Months Group","₹8,000 / $130","6 Months","2 days/week","48 live sessions","Evening / Weekend Batch","Online","Voice or instrument guidance|Basic theory|Practice support|Beginner friendly","Six-month online group music package.","10% for referred student","Trial class","Active"],
    ["PKG023","Online","Drawing","Online Drawing - Monthly","₹800 / $15","Monthly","2 days/week","8 live sessions","Evening / Weekend Batch","Online","Sketching basics|Color practice|Creative projects|Step-by-step guidance","Online drawing and creative art class for children and beginners.","5% for referred student","Trial class","Active"],
    ["PKG024","Online","Drawing","Online Drawing - 3 Months","₹2,200 / $40","3 Months","2 days/week","24 live sessions","Evening / Weekend Batch","Online","Sketching basics|Color practice|Creative projects|Step-by-step guidance","Three-month online drawing package with discounted fee.","7% for referred student","Trial class","Active"],
    ["PKG025","Online","Drawing","Online Drawing - 6 Months","₹4,000 / $70","6 Months","2 days/week","48 live sessions","Evening / Weekend Batch","Online","Sketching basics|Color practice|Creative projects|Step-by-step guidance","Six-month online drawing package for steady improvement.","10% for referred student","Trial class","Active"],
    ["PKG026","Online","Drawing","Online Drawing - 12 Months","₹7,500 / $125","12 Months","2 days/week","96 live sessions","Evening / Weekend Batch","Online","Sketching basics|Color practice|Creative projects|Step-by-step guidance","Annual online drawing package with maximum savings.","10% for referred student","Trial class","Active"],
    ["PKG027","Offline","Yoga","Offline Yoga - Monthly","₹1,000","Monthly","3 days/week","12 studio sessions","Morning / Evening Batch","Pranavam Academy","Asanas|Pranayama|Meditation|In-person correction","Regular offline yoga class at Pranavam Academy.","5% for referred student","Trial class","Active"],
    ["PKG028","Offline","Yoga","Offline Yoga - 3 Months","₹2,700","3 Months","3 days/week","36 studio sessions","Morning / Evening Batch","Pranavam Academy","Asanas|Pranayama|Meditation|In-person correction","Three-month offline yoga package with discounted fee.","7% for referred student","Trial class","Active"],
    ["PKG029","Offline","Yoga","Offline Yoga - 6 Months","₹5,000","6 Months","3 days/week","72 studio sessions","Morning / Evening Batch","Pranavam Academy","Asanas|Pranayama|Meditation|In-person correction","Six-month offline yoga package for consistent practice.","10% for referred student","Trial class","Active"],
    ["PKG030","Offline","Yoga","Offline Yoga - 12 Months","₹9,000","12 Months","3 days/week","144 studio sessions","Morning / Evening Batch","Pranavam Academy","Asanas|Pranayama|Meditation|In-person correction","Annual offline yoga package with maximum savings.","10% for referred student","Trial class","Active"],
    ["PKG031","Offline","Karate","Offline Karate - Monthly","₹800","Monthly","2 days/week","8 studio sessions","Evening / Weekend Batch","Pranavam Academy","Karate basics|Fitness|Discipline|Self-defense","Offline karate training for children and regular learners.","5% for referred student","Trial class","Active"],
    ["PKG032","Offline","Karate","Offline Karate - 3 Months","₹2,200","3 Months","2 days/week","24 studio sessions","Evening / Weekend Batch","Pranavam Academy","Karate basics|Fitness|Discipline|Self-defense","Three-month offline karate package with discounted fee.","7% for referred student","Trial class","Active"],
    ["PKG033","Offline","Karate","Offline Karate - 6 Months","₹4,200","6 Months","2 days/week","48 studio sessions","Evening / Weekend Batch","Pranavam Academy","Karate basics|Fitness|Discipline|Self-defense","Six-month offline karate package.","10% for referred student","Trial class","Active"],
    ["PKG034","Offline","Karate","Offline Karate - 12 Months","₹7,500","12 Months","2 days/week","96 studio sessions","Evening / Weekend Batch","Pranavam Academy","Karate basics|Fitness|Discipline|Self-defense","Annual offline karate package with maximum savings.","10% for referred student","Trial class","Active"],
    ["PKG035","Offline","Dance","Offline Dance - Monthly","₹1,000","Monthly","2 days/week","8 studio sessions","Evening / Weekend Batch","Pranavam Academy","Dance basics|Rhythm|Choreography practice|Stage confidence","Offline dance class for children and regular learners.","5% for referred student","Trial class","Active"],
    ["PKG036","Offline","Dance","Offline Dance - 3 Months","₹2,700","3 Months","2 days/week","24 studio sessions","Evening / Weekend Batch","Pranavam Academy","Dance basics|Rhythm|Choreography practice|Stage confidence","Three-month offline dance package.","7% for referred student","Trial class","Active"],
    ["PKG037","Offline","Dance","Offline Dance - 6 Months","₹5,000","6 Months","2 days/week","48 studio sessions","Evening / Weekend Batch","Pranavam Academy","Dance basics|Rhythm|Choreography practice|Stage confidence","Six-month offline dance package.","10% for referred student","Trial class","Active"],
    ["PKG038","Offline","Dance","Offline Dance - 12 Months","₹9,000","12 Months","2 days/week","96 studio sessions","Evening / Weekend Batch","Pranavam Academy","Dance basics|Rhythm|Choreography practice|Stage confidence","Annual offline dance package with maximum savings.","10% for referred student","Trial class","Active"],
    ["PKG039","Offline","Music","Offline Music - Group Monthly","₹1,500","Monthly","2 days/week","8 studio sessions","Evening / Weekend Batch","Pranavam Academy","Voice or instrument guidance|Music basics|Practice support|Progress review","Offline music class at Pranavam Academy.","5% for referred student","Trial class","Active"],
    ["PKG040","Offline","Music","Offline Music - Individual Monthly","₹3,000","Monthly","1 day/week","4 personal sessions","By appointment","Pranavam Academy","One-to-one guidance|Personal practice plan|Progress feedback|Voice or instrument support","Individual offline music coaching package.","5% for referred student","Trial class","Active"],
    ["PKG041","Offline","Music","Offline Music - 3 Months Group","₹4,200","3 Months","2 days/week","24 studio sessions","Evening / Weekend Batch","Pranavam Academy","Voice or instrument guidance|Music basics|Practice support|Progress review","Three-month offline group music package.","7% for referred student","Trial class","Active"],
    ["PKG042","Offline","Music","Offline Music - 6 Months Group","₹8,000","6 Months","2 days/week","48 studio sessions","Evening / Weekend Batch","Pranavam Academy","Voice or instrument guidance|Music basics|Practice support|Progress review","Six-month offline group music package.","10% for referred student","Trial class","Active"],
    ["PKG043","Offline","Drawing","Offline Drawing - Monthly","₹600","Monthly","2 days/week","8 studio sessions","Evening / Weekend Batch","Pranavam Academy","Sketching basics|Coloring|Creative projects|Teacher guidance","Offline drawing and creative art class for children.","5% for referred student","Trial class","Active"],
    ["PKG044","Offline","Drawing","Offline Drawing - 3 Months","₹1,600","3 Months","2 days/week","24 studio sessions","Evening / Weekend Batch","Pranavam Academy","Sketching basics|Coloring|Creative projects|Teacher guidance","Three-month offline drawing package.","7% for referred student","Trial class","Active"],
    ["PKG045","Offline","Drawing","Offline Drawing - 6 Months","₹3,000","6 Months","2 days/week","48 studio sessions","Evening / Weekend Batch","Pranavam Academy","Sketching basics|Coloring|Creative projects|Teacher guidance","Six-month offline drawing package.","10% for referred student","Trial class","Active"],
    ["PKG046","Offline","Drawing","Offline Drawing - 12 Months","₹5,500","12 Months","2 days/week","96 studio sessions","Evening / Weekend Batch","Pranavam Academy","Sketching basics|Coloring|Creative projects|Teacher guidance","Annual offline drawing package with maximum savings.","10% for referred student","Trial class","Active"]
  ];
}

function defaultSiteImages_() {
  return [
    ['homeHero','Homepage hero','assets/images/hero-academy.jpg','Pranavam Academy online and offline programs','Active','Use a public HTTPS image URL here to replace from backend'],
    ['onlineYoga','Online Yoga program card','assets/images/online-yoga.jpg','Online yoga class with live students','Active',''],
    ['karate','Karate section','assets/images/karate.jpg','Karate class at Pranavam Academy','Active',''],
    ['dance','Dance section','assets/images/dance.jpg','Dance class at Pranavam Academy','Active',''],
    ['music','Music section','assets/images/music.jpg','Music class at Pranavam Academy','Active',''],
    ['drawing','Drawing section','assets/images/drawing.jpg','Drawing and art class at Pranavam Academy','Active',''],
    ['teachWithUs','Teach With Us section','assets/images/teach-with-us.jpg','Teacher guiding students at Pranavam Academy','Active',''],
    ['yogaAccessible','Yoga Accessible to All','assets/images/yoga-accessible.jpg','Yoga accessible to all group session','Active',''],
    ['referFriend','Refer a Friend','assets/images/refer-friend.jpg','Friends learning together at Pranavam Academy','Active',''],
    ['yogaHero','Yoga page hero','assets/images/online-yoga.jpg','Pranavam online yoga class','Active',''],
    ['groupYoga','Group Yoga card','assets/images/online-yoga.jpg','Online group yoga class','Active',''],
    ['corporateYoga','Corporate Yoga page/card','assets/images/yoga-accessible.jpg','Corporate wellness yoga session','Active',''],
    ['therapeuticYoga','Therapeutic Yoga card','assets/images/yoga-accessible.jpg','Therapeutic yoga support session','Active',''],
    ['onlineGroupYogaHero','Online Group Yoga page hero','assets/images/online-yoga.jpg','Online group yoga class at Pranavam Academy','Active',''],
    ['onlineGroupYogaBenefits','Online Group Yoga benefits section','assets/images/yoga-accessible.jpg','Guided online yoga practice','Active',''],
    ['therapeuticYogaHero','Therapeutic Yoga page hero','assets/images/yoga-accessible.jpg','Online therapeutic yoga guidance','Active',''],
    ['therapeuticYogaBenefits','Therapeutic Yoga benefits section','assets/images/yoga-accessible.jpg','Gentle therapeutic yoga session','Active',''],
    ['yogaWorldPeace','Yoga for World Peace section','assets/images/yoga-accessible.jpg','Yoga for world peace','Active',''],
    ['offlineHero','Offline classes page hero','assets/images/hero-academy.jpg','Offline programs at Pranavam Academy','Active',''],
    ['packagesHero','Packages page hero','assets/images/teach-with-us.jpg','Pranavam Academy packages discussion','Active',''],
    ['registerHero','Register page hero','assets/images/refer-friend.jpg','Register for Pranavam Academy classes','Active',''],
    ['teacherHero','Teacher page hero','assets/images/teach-with-us.jpg','Teach with Pranavam Academy','Active','']
  ];
}

function defaultSliderBanners_() {
  return [
    ['BNR001','home',1,'Online & Offline Programs','Pranavam Academy','Where Passion Meets Purpose. Learn Yoga, Karate, Dance, Music and Drawing through professional online and offline programs.','assets/images/hero-academy.jpg','Pranavam Academy online and offline programs','Register Now','register.html','View Packages','packages.html','Active','Homepage slider banner 1'],
    ['BNR002','home',2,'Yoga Accessible to All','Donation-Based Online Yoga','Join online group yoga classes and contribute any amount you wish. No minimum or suggested donation.','assets/images/yoga-accessible.jpg','Yoga accessible to all at Pranavam Academy','Explore Yoga','yoga.html','Register','register.html','Active','Homepage slider banner 2'],
    ['BNR003','home',3,'Teach With Us','Join Pranavam as a Teacher','Qualified teachers can join our mission to expand wellness, discipline, creativity and learning.','assets/images/teach-with-us.jpg','Teacher guiding students at Pranavam Academy','Apply Now','become-a-teacher.html','Main Programs','#main-programs','Active','Homepage slider banner 3']
  ];
}

function cleanError_(err) {
  return err && err.message ? err.message : String(err);
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function webOutput_(obj, params) {
  const callback = params && params.callback ? String(params.callback).replace(/[^a-zA-Z0-9_.$]/g, '') : '';
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOutput_(obj);
}
