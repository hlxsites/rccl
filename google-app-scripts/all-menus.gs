/** 
 * Google Apps Script - List all menus under a ship into a speadsheet.
 *    - Main function 1: allMenus
 * 
 * Hint: Set your folder ID first! You may copy the folder ID from the browser's address field. 
 *       The folder ID is everything after the 'folders/' portion of the URL.
 *       Set the spreadsheetId to wherever you want the data to be saved
 *       Ensure you have 3 tabs helix-menus, helix-menu-details and helix-metadata defined in the target spreadsheet
 */
 
// TODO: Set folder ID and target spreadsheet ID and sheet name
var folderId = '17_6aI6Jzn9z3pLpJKHNOBs6fxtfP_a8o';
var spreadsheetId = '1CL0TPDYxYZFxCbYNL_VOoZZ0KE4egLbJYmRqLiGC734';
var allmenusIndexSheet = 'helix-menus';
var allmenusMetadataSheet = 'helix-menu-metadata';
var allmenusDetailsSheet = 'helix-menu-details';
var menuMetadataSheet = 'helix-metadata';

// Main function 1: List all files & folders, & write into the current sheet.
async function allMenus(){
  try {
    await getFolderTree(folderId, true); 
  } catch (e) {
    Logger.log(e.toString());
  }
};

// Helper function: create and add formula to metadata sheet
async function insertMenuMetadata(metadataSheet, path, filename, url){
  try {
    // Initialise the sheet
    // var file, data, sheet = SpreadsheetApp.getActiveSheet();
    var menu = SpreadsheetApp.openByUrl(url).getSheetByName(menuMetadataSheet);
    var menuRange = menu.getDataRange();
    var menuValues = menuRange.getValues();
    menuValues.shift();
    var menuKey = menuValues[0][8];
    if (menuValues.length > 1) {
      for (var i=1; i<menuValues.length; i++) {
        menuValues[i][8] = menuKey;  
      }
    }
    // Logger.log("Last row +1 is: "+(metadataSheet.getLastRow()+1)+", rows: "+menuValues.length+", columns: "+menuValues[0].length);
    var destRange = await metadataSheet.getRange(metadataSheet.getLastRow()+1,1,menuValues.length,menuValues[0].length);
    await destRange.setValues(menuValues);
  } catch (e) {
    Logger.log(e.toString());
  }
};

// Helper function: create and add formula to metadata sheet
async function insertMenuDetails(menuDetailsSheet, path, filename, url){
  try {
    // Initialise the sheet
    var menuDetailsSheetName = "helix-"+filename;
    var menu = SpreadsheetApp.openByUrl(url).getSheetByName(menuDetailsSheetName);
    var menuRange = menu.getDataRange();
    var menuValues = menuRange.getValues();
    menuValues.shift();
    var lastElementPosition = menuValues[0].length;
    for (var i=0; i<menuValues.length; i++) {
      menuValues[i][lastElementPosition] = filename;  
    }
    // Logger.log("Last row +1 is: "+(metadataSheet.getLastRow()+1)+", rows: "+menuValues.length+", columns: "+menuValues[0].length);
    var destRange = await menuDetailsSheet.getRange(menuDetailsSheet.getLastRow()+1,1,menuValues.length,menuValues[0].length);
    await destRange.setValues(menuValues);
  } catch (e) {
    Logger.log(e.toString());
  }
};

// =================
// Get Folder Tree
async function getFolderTree(folderId, listAll) {
  try {
    // Get folder by id
    var parentFolder = DriveApp.getFolderById(folderId);
    
    // Initialise the sheet
    // var file, data, sheet = SpreadsheetApp.getActiveSheet();
    var file, data, sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(allmenusIndexSheet);
    sheet.clear();
    sheet.appendRow(["Full Path", "Name", "Date", "Last Updated", "URL"]);
    //Initialize metadata tab
    var metadataSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(allmenusMetadataSheet);
    metadataSheet.clear();
    metadataSheet.appendRow(["Title",	"mealTypeTags",	"mealTypeTagsDescriptions",	"advisoryTags",	"advisoryTagsDescriptions",	"menuDays",	"fileName",	"googleSheetId",	"menukey"]);
    //Initialize menu details tab
    var menuDetailsSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(allmenusDetailsSheet);
    menuDetailsSheet.clear();
    menuDetailsSheet.appendRow(["hide", "sectionName", "name", "*", "noSugar", "vegan", "vegetarian", "glutenFree", "description", "price", "wineNumber", "glassPrice", "bottlePrice", "menukey"]);
    // Get files and folders
    await getChildFolders(parentFolder.getName(), parentFolder, data, sheet, listAll, metadataSheet, menuDetailsSheet);    
  } catch (e) {
    Logger.log(e.toString());
  }
};

// Get the list of files and their metadata in recursive mode
async function getChildFolders(parentName, parent, data, sheet, listAll, metadataSheet, menuDetailsSheet) {
  try {
    var childFolders = parent.getFolders();
    // List folders inside the folder
    while (childFolders.hasNext()) {
      var childFolder = childFolders.next();
      
      // List files inside the folder
      var files = childFolder.getFiles();
      while (listAll & files.hasNext()) {
        var childFile = files.next();
        var filePath = parentName + "/" + childFolder.getName() + "/" + childFile.getName();
        data = [ 
          filePath,
          childFile.getName(),
          childFile.getDateCreated(),
          childFile.getLastUpdated(),
          childFile.getUrl()      
        ];
        // Write
        await sheet.appendRow(data);
        await insertMenuMetadata(metadataSheet, filePath, childFile.getName(), childFile.getUrl());
        await insertMenuDetails(menuDetailsSheet, filePath, childFile.getName(), childFile.getUrl());
      }  
      // Recursive call of the subfolder
      getChildFolders(parentName + "/" + childFolder.getName(), childFolder, data, sheet, listAll);  
    }
  } catch (e) {
    Logger.log(e.toString());
  }
};