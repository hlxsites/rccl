/** 
 * Google Apps Script - List all files & folders in a Google Drive folder, & write into a speadsheet.
 *    - Main function 1: List all folders
 *    - Main function 2: List all files & folders
 * 
 * Hint: Set your folder ID first! You may copy the folder ID from the browser's address field. 
 *       The folder ID is everything after the 'folders/' portion of the URL.
 * 
 * @version 1.0
 * @see     https://github.com/mesgarpour
 */
 
// TODO: Set folder ID and target spreadsheet ID and sheet name
var folderId = '17_6aI6Jzn9z3pLpJKHNOBs6fxtfP_a8o';
var spreadsheetId = '1T_9kq7iVUA7R-tw27VIzTh7Nn8mGGB09cb4RzRnE4Z8';
var targetSheetName = 'menus';

// Main function 1: List all folders, & write into the current sheet.
function listFolders(){
  getFolderTree(folderId, false);
};

// Main function 2: List all files & folders, & write into the current sheet.
function listAll(){
  getFolderTree(folderId, true); 
};

function previewPath(path) {

}

/**
 * Sanitizes the given string by :
 * - convert to lower case
 * - normalize all unicode characters
 * - replace all non-alphanumeric characters with a dash
 * - remove all consecutive dashes
 * - remove all leading and trailing dashes
 *
 * @param {string} name
 * @returns {string} sanitized name
 */
function sanitizeName(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
}

// =================
// Get Folder Tree
function getFolderTree(folderId, listAll) {
  try {
    // Get folder by id
    var parentFolder = DriveApp.getFolderById(folderId);
    
    // Initialise the sheet
    // var file, data, sheet = SpreadsheetApp.getActiveSheet();
    var file, data, sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(targetSheetName);
    sheet.clear();
    sheet.appendRow(["Full Path", "Name", "Date", "Last Updated", "URL"]);
    
    // Get files and folders
    getChildFolders(parentFolder.getName(), parentFolder, data, sheet, listAll);
    
  } catch (e) {
    Logger.log(e.toString());
  }
};

// Get the list of files and their metadata in recursive mode
function getChildFolders(parentName, parent, data, sheet, listAll) {
  var childFolders = parent.getFolders();
  
  // List folders inside the folder
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    // Logger.log("Folder Name: " + childFolder.getName());
    // data = [ 
    //   parentName + "/" + childFolder.getName(),
    //   childFolder.getName(),
    //   childFolder.getDateCreated(),
    //   childFolder.getLastUpdated()
    // ];
    // Write
    // Uncomment to also write folders into the sheet
    // sheet.appendRow(data);
    
    // List files inside the folder
    var files = childFolder.getFiles();
    while (listAll & files.hasNext()) {
      var childFile = files.next();
      // Logger.log("File Name: " + childFile.getName());
      data = [ 
        parentName + "/" + sanitizeName(childFolder.getName()) + "/" + sanitizeName(childFile.getName()),
        childFile.getName(),
        childFile.getDateCreated(),
        childFile.getLastUpdated(),
        childFile.getUrl()
      ];
      // Write
      sheet.appendRow(data);
    }
    
    // Recursive call of the subfolder
    getChildFolders(parentName + "/" + childFolder.getName(), childFolder, data, sheet, listAll);  
  }
};