/**
 * @OnlyCurrentDoc  Limits the script to only accessing the current spreadsheet.
 */

var SIDEBAR_TITLE = "Time and tide waits for none";

/**
 * Adds a custom menu with items to show the sidebar and dialog.
 *
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem('Start', 'showSidebar')
    .addToUi();
}

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens a sidebar. The sidebar structure is described in the Sidebar.html
 * project file.
 */
function showSidebar() {
  SpreadsheetApp.flush();

  var ui = HtmlService.createTemplateFromFile('Sidebar')
    .evaluate()
    .setTitle(SIDEBAR_TITLE)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(ui);

  // deleteTriggers();
  // processTimes();
}

/**
 * Deletes triggers.
 */
function deleteTriggers() {
  Logger.log("deleteTriggers");
  // Loop over all triggers.
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

function getData() {
  SpreadsheetApp.flush();

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = activeSpreadsheet.getActiveSheet();

  const spreadsheetTimeZone = activeSpreadsheet.getSpreadsheetTimeZone();
  let spreadsheetLocale = activeSpreadsheet.getSpreadsheetLocale() || 'en-US';
  spreadsheetLocale = 'en-US';
  let nowDate = new Date();

  let year = Utilities.formatDate(nowDate, spreadsheetTimeZone, "yyyy")
  let month = Utilities.formatDate(nowDate, spreadsheetTimeZone, "MM")
  let day = Utilities.formatDate(nowDate, spreadsheetTimeZone, "dd")

  var now = Utilities.formatDate(nowDate, spreadsheetTimeZone, "yyyy-MM-dd HH:mm:ss");
  let nowTime = nowDate.getTime();

  // The code below gets the values for the column
  // in the active spreadsheet.  Note that this is a JavaScript array.
  var data = activeSheet.getRange("C:D").getValues();
  const timesAndTides = [];
  let format = `${year}-${month}-${day} HH:mm:ss`;
  let lastTime = null;
  let durationMilliseconds;
  Logger.log({'nowTime':(new Date(nowTime)).toString()});
  for (let i = 0; i < data.length; i++) {
    let eachData = data[i];
    let targetFormatDate = Utilities.formatDate(eachData[0], spreadsheetTimeZone, format);
    let targetDate = new Date(targetFormatDate);
    if(targetDate>nowTime){ // If target time is older than last time
      targetTime = targetDate.getTime();
      durationMilliseconds = targetTime - nowTime;

      timesAndTides.push({ delay: durationMilliseconds, info: eachData[1], time: Utilities.formatDate(eachData[0], spreadsheetTimeZone, "HH:mm:ss") });

      lastTime = targetTime;
    }
  }
  Logger.log(timesAndTides)
  return JSON.stringify(timesAndTides);
}

function getInfoData() {
  SpreadsheetApp.flush();

  Logger.log("getInfoData");

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Time&Date");
  if (sheet != null) {
    var data = sheet.getRange("A1").getValues();
    Logger.log(data)
  }
  
  return data;
}

function processTimes() {
  const data = JSON.parse(getData());
  // var now = Utilities.formatDate(new Date(), spreadsheetTimeZone, "'0001-01-01T'HH:mm:ss'Z'");
  // Logger.log("N:" + now + (new Date(now)).getTime());
  // for (let i = 30; i <= 40; i++) {
  //   let time = data[i];
  //   var future = Utilities.formatDate(time[0], spreadsheetTimeZone, "'0001-01-01T'HH:mm:ss'Z'");
  //   let durationMilliseconds = (new Date(future)).getTime() - (new Date(now)).getTime();
  //   Logger.log("DI: " + durationMilliseconds);
  //   if ((durationMilliseconds) < 0) {
  //     future = Utilities.formatDate(time[0], spreadsheetTimeZone, "'0001-01-02T'HH:mm:ss'Z'");
  //     durationMilliseconds = (new Date(future)).getTime() - (new Date(now)).getTime();
  //     Logger.log("DF: " + durationMilliseconds);
  //   }
  //   Logger.log("T: " + future + (new Date(future)).getTime());
  //   triggerAfter(durationMilliseconds);
  //   Utilities.sleep(1000);
  // }

}

function triggerfunction() {
  Logger.log(Utilities.formatDate(new Date(), "Asia/Dhaka", "'Trigger: 'HH:mm:ss'Z'"));
}

function triggerAfter(durationMilliseconds) {
  if (durationMilliseconds > 0) {
    Logger.log("Creates a trigger");
    // Creates a trigger that runs durationMilliseconds later
    ScriptApp.newTrigger("triggerfunction")
      .timeBased()
      .after(durationMilliseconds)
      .create();
  }
}
