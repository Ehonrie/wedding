/**
 * Wedding RSVP + ticket backend (Google Apps Script, bound to a Google Sheet).
 *
 * Columns (row 1 is created automatically):
 *   A Timestamp | B Ticket ID | C Name | D Phone | E Attending | F Guests | G Checked In At
 *
 * Setup steps are in README.md. The scanner PIN lives in Script Properties
 * (key: SCANNER_PIN), never in the website code.
 */

var SHEET_NAME = 'RSVPs';
var HEADERS = ['Timestamp', 'Ticket ID', 'Name', 'Phone', 'Attending', 'Guests', 'Checked In At'];

function doGet() {
  return json_({ ok: true, data: 'Wedding API is running' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var req = JSON.parse(e.postData.contents);
    switch (req.action) {
      case 'rsvp':
        return json_({ ok: true, data: rsvp_(req) });
      case 'lookup':
        return lookup_(req);
      case 'list':
        requirePin_(req.pin);
        return json_({ ok: true, data: allRows_() });
      case 'checkin':
        requirePin_(req.pin);
        return json_({ ok: true, data: checkin_(req.ticketId) });
      default:
        return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- actions ---------- */

function rsvp_(req) {
  var name = String(req.name || '').trim();
  var phone = normalisePhone_(req.phone);
  var guests = Math.max(1, Math.min(20, parseInt(req.guests, 10) || 1));
  if (!name) throw new Error('Please enter your name.');
  if (phone.length < 10) throw new Error('Please enter a valid phone number.');

  var sheet = sheet_();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (normalisePhone_(rows[i][3]) === phone) {
      // Same phone RSVPing again: update the existing row, keep the ticket.
      // The name must match so nobody can overwrite someone else's RSVP.
      if (!sameName_(rows[i][2], name)) {
        throw new Error('This number has already RSVP\'d under a different name. Use "Retrieve my ticket" or a different number.');
      }
      var ticketId = rows[i][1];
      if (req.attending && !ticketId) ticketId = newTicketId_();
      sheet.getRange(i + 1, 2, 1, 5).setValues([[ticketId, name, phone, req.attending ? 'Yes' : 'No', guests]]);
      return toRecord_(sheet.getRange(i + 1, 1, 1, 7).getValues()[0]);
    }
  }

  var row = [new Date(), req.attending ? newTicketId_() : '', name, phone, req.attending ? 'Yes' : 'No', guests, ''];
  sheet.appendRow(row);
  sheet.getRange(sheet.getLastRow(), 4).setNumberFormat('@').setValue(phone); // keep leading 0
  return toRecord_(row);
}

function lookup_(req) {
  // Phone alone is not secret, so the name must match as well.
  var phone = normalisePhone_(req.phone);
  var rows = allRows_();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].phone === phone && sameName_(rows[i].name, req.name)) return json_({ ok: true, data: rows[i] });
  }
  return json_({ ok: false, error: 'We could not find an RSVP with that name and number.' });
}

function sameName_(a, b) {
  function clean(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  return clean(a) === clean(b);
}

function checkin_(ticketId) {
  var sheet = sheet_();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] && rows[i][1] === ticketId) {
      if (rows[i][6]) return { status: 'duplicate', guest: toRecord_(rows[i]) };
      var now = new Date();
      sheet.getRange(i + 1, 7).setValue(now);
      rows[i][6] = now;
      return { status: 'ok', guest: toRecord_(rows[i]) };
    }
  }
  return { status: 'invalid' };
}

/* ---------- helpers ---------- */

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function allRows_() {
  var values = sheet_().getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) out.push(toRecord_(values[i]));
  return out;
}

function toRecord_(r) {
  return {
    createdAt: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
    ticketId: String(r[1] || ''),
    name: String(r[2]),
    phone: normalisePhone_(r[3]),
    attending: r[4] === 'Yes',
    guests: Number(r[5]) || 1,
    checkedInAt: r[6] instanceof Date ? r[6].toISOString() : String(r[6] || ''),
  };
}

function normalisePhone_(raw) {
  var d = String(raw || '').replace(/\D/g, '');
  if (d.indexOf('234') === 0 && d.length > 10) d = '0' + d.slice(3);
  if (d.length === 10 && d.charAt(0) !== '0') d = '0' + d;
  return d;
}

function newTicketId_() {
  var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var uuid = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  var id = '';
  for (var i = 0; i < 10; i++) id += alphabet.charAt(parseInt(uuid.substr(i * 2, 2), 16) % alphabet.length);
  return 'AP-' + id;
}

function requirePin_(pin) {
  var expected = PropertiesService.getScriptProperties().getProperty('SCANNER_PIN');
  if (!expected) throw new Error('Scanner PIN is not set on the server.');
  if (String(pin) !== String(expected)) throw new Error('Wrong PIN.');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
