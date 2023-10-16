const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function getDateDirName() {
  const date = new Date();
  let month = Number.parseInt(date.getMonth()) + 1;
  month = month.toString().length > 1 ? month : `0${month}`;
  return `${date.getFullYear()}${month}${date.getDate()}`;
}

async function saveFile(fileName) {
  const basename = path.basename(fileName);
  const absolutePathToSaveFile = path.join(getUploadDir(), getDateDirName());
  const fileAbsPath = path.join(absolutePathToSaveFile, basename);
  if (!fs.existsSync(absolutePathToSaveFile)) {
    fs.mkdirSync(absolutePathToSaveFile);
  }
  // move the temp file to the new location
  fs.renameSync(path.join(getUploadDir(), fileName), fileAbsPath);
  return getFileRelativePath(fileAbsPath);
}

function getSrcFileAbsolutePath(fileRelativePath) {
  return path.join(getStaticFileRoot(), fileRelativePath);
}

function getOutputFileAbsolutePath(fileExtension) {
  let output = path.join(getOutputDir(), getDateDirName());
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }
  const fileName = `${uuidv4()}_${new Date().getTime()}.${fileExtension}`;
  const fileAbsPath = path.join(output, fileName);
  if (fs.existsSync(fileAbsPath)) {
    fs.unlinkSync(fileAbsPath);
  }
  return fileAbsPath;
}

function getFileRelativePath(absoluteFilePath) {
  return path.relative(getStaticFileRoot(), absoluteFilePath);
}

function getStaticFileRoot() {
  return path.join(__dirname, 'static');
}

function getUploadDir() {
  const uploadDir = path.join(getStaticFileRoot(), 'fileUploads/');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  return uploadDir;
}

function getOutputDir() {
  const outputDir = path.join(getStaticFileRoot(), 'fileOutput');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  return outputDir;
}

module.exports = {
  saveFile,
  getFileRelativePath,
  getSrcFileAbsolutePath,
  getStaticFileRoot,
  getOutputFileAbsolutePath,
  getUploadDir,
};
