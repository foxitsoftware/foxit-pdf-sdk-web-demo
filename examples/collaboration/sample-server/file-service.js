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
function setupFileService(app) {
    console.log("initiated file service");
    app.use((0, cors_1.default)());
    app.use((0, express_fileupload_1.default)({
        createParentPath: true,
        defParamCharset: 'utf8'
    }));
    app.post("/api/files/upload", function (req, res) {
        console.log("start uploading files");
        let uploadFile;
        let uploadPath;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ret: -1,
                message: 'No files were uploaded.'
            });
        }
        uploadFile = req.files.file;
        const fileName = uploadFile.name;
        const username = req.query.username;
        uploadPath = path_1.default.resolve(FILE_UPLOAD_BASE, username, fileName);
        console.log("saving files to: ", uploadPath);
        uploadFile.mv(uploadPath, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({
                    ret: -1,
                    message: err.message
                });
            }
            res.json({
                ret: 0,
                message: 'success',
                data: {
                    path: `${FILE_PATH_PREFIX}/${fileName}`
                }
            });
        });
    });
    app.get("/api/files/list", function (req, res) {
        const username = req.query.username;
        fs_1.default.readdir(FILE_UPLOAD_BASE + `/${username}`, (err, files) => {
            if (!files) {
                res.json({
                    ret: 0,
                    data: []
                });
            }
            else {
                res.json({
                    ret: 0,
                    data: files.map(fileName => {
                        return {
                            name: fileName,
                            path: `${FILE_PATH_PREFIX}/${username}/${fileName}`
                        };
                    })
                });
            }
        });
    });
    app.use(FILE_PATH_PREFIX, express_1.default.static(path_1.default.resolve(FILE_UPLOAD_BASE), {
        acceptRanges: false,
        cacheControl: false,
        etag: false,
        lastModified: false
    }));
}
exports.setupFileService = setupFileService;
//# sourceMappingURL=file-service.js.map