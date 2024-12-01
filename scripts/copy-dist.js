import fs from "fs";

console.log("Copying JS files...");
// Source and destination paths
const sourceFilePattern = "index-";
const destinationFile = "dist/papel.js";

// Get the source file
const sourceFile = fs
  .readdirSync("docs/assets")
  .find((file) => file.startsWith(sourceFilePattern));

fs.copyFile("docs/assets/" + sourceFile, destinationFile, (err) => {
  if (err) {
    console.error("Error copying file:", err);
  } else {
    console.log("File copied successfully:", destinationFile);
  }
});
