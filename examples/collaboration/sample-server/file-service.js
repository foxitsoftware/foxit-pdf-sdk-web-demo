"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFileService = void 0;
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const FILE_UPLOAD_BASE = process.env['FILE_UPLOAD_BASE'] || path_1.default.resolve(process.cwd(), 'file-uploads');
const FILE_PATH_PREFIX = '/files';

// Whitelist: Only allow PDF files
const ALLOWED_MIME_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['.pdf'];

// PDF magic bytes for content validation
const PDF_MAGIC_BYTES = '25504446'; // %PDF in hex

/**
 * Validate if file is a genuine PDF by checking magic bytes
 */
function isPDFFile(buffer) {
  const fileHeader = buffer.slice(0, 4).toString('hex');
  return fileHeader === PDF_MAGIC_BYTES;
}

/**
 * Sanitize username to prevent path traversal and XSS attacks
 * Supports international characters (Chinese, Japanese, Korean, etc.)
 * Uses blacklist approach to exclude only unsafe characters
 */
function sanitizeUsername(username) {
  if (!username || typeof username !== 'string') {
    return null;
  }
  
  // Reject usernames that are too long
  if (username.length > 50 || username.length === 0) {
    return null;
  }
  
  // Reject usernames containing path traversal sequences (.. in any form)
  // This catches: .., ../, ..\, etc.
  if (username.includes('..')) {
    return null;
  }
  
  // Reject usernames that start or end with a dot (hidden files, special names)
  if (username.startsWith('.') || username.endsWith('.')) {
    return null;
  }
  
  // Reject usernames containing unsafe characters (use blacklist approach to support Unicode/international characters)
  // Exclude: path separators (/ \), null byte, control characters, and problematic characters (< > : " | ? * & ; $ ` ' = + , @)
  // Also exclude Unicode look-alike characters for slashes: ／(U+FF0F), ⁄(U+2044), ∕(U+2215)
  const unsafeCharsRegex = /[\/\\:\*\?"<>\|&;$`'=+,@\uff0f\u2044\u2215]/;
  const controlCharsRegex = /[\x00-\x1f\x7f]/;
  const whitespaceRegex = /\s/;
  
  if (unsafeCharsRegex.test(username) || controlCharsRegex.test(username) || whitespaceRegex.test(username)) {
    return null;
  }
  
  // Final validation: use path.basename to ensure no path components
  const basename = path_1.default.basename(username);
  if (basename !== username) {
    return null;
  }
  
  return username;
}

/**
 * Sanitize filename to prevent path traversal and malicious filenames
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return null;
  }
  // Get basename to remove any path components
  const basename = path_1.default.basename(filename);
  
  // Reject filenames that are too long or reserved names
  if (basename.length > 255 || basename === '.' || basename === '..') {
    return null;
  }
  
  // Reject filenames containing unsafe characters (use blacklist approach to support Unicode/international characters)
  // Exclude: path separators (/ \), null byte, control characters, and problematic characters (< > : " | ? *)
  const unsafeCharsRegex = /[\/\\:\*\?"<>\|]/;
  const controlCharsRegex = /[\x00-\x1f\x7f]/;
  
  if (unsafeCharsRegex.test(basename) || controlCharsRegex.test(basename)) {
    return null;
  }
  
  return basename;
}

/**
 * HTML escape function to prevent XSS attacks
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
function encodeFileName(filename) {
    const t = path_1.default.parse(filename);
  const b = Buffer.from(t.name, 'utf8');
  return b.toString('hex') + t.ext;
}
function decodeFileName(filename){
  const t = path_1.default.parse(filename);
  const b = Buffer.from(t.name, 'hex');
  return b.toString('utf8') + t.ext;
}


/**
 * This is a simple file upload service based on Express which will be integrated to the sample server.
 */
function setupFileService(app){

  console.log("initiated file service");
  app.use((0, cors_1.default)({
    exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges']
}));
  app.use((0, express_fileupload_1.default)({
    createParentPath: true,
    defParamCharset: 'utf8'
  }));
  app.post("/api/files/upload", function(req, res){
    console.log("start uploading files")

    let uploadFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ret: -1,
        message: 'No files were uploaded.'
      });
    }

    // Validate and sanitize username
    const username = sanitizeUsername(req.query.username);
    if (!username) {
      return res.status(400).json({
        ret: -1,
        message: 'Invalid username parameter.'
      });
    }

    uploadFile = req.files.file;
    
    // Validate and sanitize filename
    const sanitizedOriginalName = sanitizeFilename(uploadFile.name);
    if (!sanitizedOriginalName) {
      return res.status(400).json({
        ret: -1,
        message: 'Invalid filename. Only alphanumeric characters, dots, underscores and hyphens are allowed.'
      });
    }

    // First, validate file content is actually a PDF (magic bytes check - most reliable)
    if (!isPDFFile(uploadFile.data)) {
      return res.status(400).json({
        ret: -1,
        message: 'Only PDF files are allowed. File content validation failed.'
      });
    }

    // If file has an extension, it must be .pdf
    const fileExtension = path_1.default.extname(sanitizedOriginalName).toLowerCase();
    if (fileExtension && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return res.status(400).json({
        ret: -1,
        message: 'Only PDF files are allowed. Invalid file extension.'
      });
    }

    // Check MIME type - only allow PDF
    if (!ALLOWED_MIME_TYPES.includes(uploadFile.mimetype)) {
      return res.status(400).json({
        ret: -1,
        message: 'Only PDF files are allowed. Invalid MIME type.'
      });
    }

    const fileName = encodeFileName(sanitizedOriginalName);
    uploadPath = path_1.default.resolve(FILE_UPLOAD_BASE, username, fileName);

    // Verify the resolved path is within the expected base directory (prevent path traversal)
    const normalizedPath = path_1.default.normalize(uploadPath);
    const baseDir = path_1.default.resolve(FILE_UPLOAD_BASE, username);
    if (!normalizedPath.startsWith(baseDir)) {
      return res.status(400).json({
        ret: -1,
        message: 'Invalid file path detected.'
      });
    }

    console.log("saving files to: ", uploadPath)

    // Use the mv() method to place the file somewhere on your server
    uploadFile.mv(uploadPath, (err) => {
      if (err){
        return res
          .status(500)
          .json({
            ret: -1,
            message: err.message
          })
      }
      res.json({
        ret: 0,
        message: 'success',
        data: {
          path: `${FILE_PATH_PREFIX}/${fileName}`
        }
      });
    });
  })

  app.get("/api/files/list", function(req, res){
    // Validate and sanitize username
    const username = sanitizeUsername(req.query.username);
    if (!username) {
      return res.status(400).json({
        ret: -1,
        message: 'Invalid username parameter.'
      });
    }

    const userDir = path_1.default.resolve(FILE_UPLOAD_BASE, username);
    
    // Verify the resolved path is within the expected base directory (prevent path traversal)
    const normalizedDir = path_1.default.normalize(userDir);
    if (!normalizedDir.startsWith(path_1.default.resolve(FILE_UPLOAD_BASE))) {
      return res.status(400).json({
        ret: -1,
        message: 'Invalid directory path detected.'
      });
    }

    fs_1.default.readdir(userDir, (err, files) => {
      if(err || !files){
        res.json({
          ret: 0,
          data: []
        })
      }else{
        res.json({
          ret: 0,
          data: files.map(fileName => {
            const decodedName = decodeFileName(fileName);
            return {
              // HTML escape to prevent XSS attacks
              name: escapeHtml(decodedName),
              path: escapeHtml(`${FILE_PATH_PREFIX}/${username}/${fileName}`)
            }
          })
        })
      }
    })
  })

  // Secure static file serving with path traversal protection
  app.use(FILE_PATH_PREFIX, (req, res, next) => {
    // Decode the URL to catch encoded path traversal attempts
    const decodedPath = decodeURIComponent(req.path);
    
    // Block path traversal attempts (including encoded variants)
    if (decodedPath.includes('..') || decodedPath.includes('\0')) {
      return res.status(400).json({
        ret: -1,
        message: 'Invalid path detected.'
      });
    }
    
    // Validate the resolved path stays within FILE_UPLOAD_BASE
    const requestedPath = path_1.default.resolve(FILE_UPLOAD_BASE, '.' + decodedPath);
    const normalizedBase = path_1.default.resolve(FILE_UPLOAD_BASE);
    
    if (!requestedPath.startsWith(normalizedBase + path_1.default.sep) && requestedPath !== normalizedBase) {
      return res.status(400).json({
        ret: -1,
        message: 'Access denied.'
      });
    }
    
    next();
  }, express_1.default.static(path_1.default.resolve(FILE_UPLOAD_BASE), {
    acceptRanges: true,
    cacheControl: false,
    etag: false,
    lastModified: false,
    dotfiles: 'deny',  // Deny access to dotfiles
    index: false       // Disable directory indexing
  }));
}
exports.setupFileService = setupFileService;
//# sourceMappingURL=file-service.js.map