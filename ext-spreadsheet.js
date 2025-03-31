// Adds a menu item "Financial Report Summarizer" when the spreadsheet opens.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Financial Report Summarizer')
    .addItem('Open Sidebar', 'showSidebar')
    .addToUi();
}

// Opens a sidebar UI for user interaction.
function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Financial Summary')
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

// Fetches selected spreadsheet data.
function getSelectedData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getActiveRange();
  var values = range.getValues();
  return values;
}

// Sends data to the backend API for categorization.
function processFinancialData() {
  var data = getSelectedData();
  var scriptProperties = PropertiesService.getScriptProperties();
  var backendUrl = scriptProperties.getProperty('BACKEND_URL');
  var response = UrlFetchApp.fetch(backendUrl + '/process', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ transactions: data })
  });
  
  var result = JSON.parse(response.getContentText());
  return result.summary;
}

//  Inserts the processed summary back into the sheet.
function insertSummary() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var summary = processFinancialData();
  sheet.getRange('H1').setValue('Financial Summary');
  sheet.getRange('H2').setValue(summary);
}
