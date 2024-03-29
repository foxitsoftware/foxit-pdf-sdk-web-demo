"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverPort = void 0;
const web_collab_server_1 = require("@foxitsoftware/web-collab-server");
const file_service_1 = require("./file-service");
const user_service_1 = require("./user-service");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.serverPort = process.env['SERVER_PORT'] ? +process.env['SERVER_PORT'] : 8080;
const databaseConfig = {
    type: process.env['DB_TYPE'] || 'postgres',
    host: process.env['DB_HOST'] || 'localhost',
    port: process.env['DB_PORT'] ? +process.env['DB_PORT'] : 5432,
    database: process.env['DB_DATABASE'] || 'collab-db',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '123456',
};
const server = new web_collab_server_1.WebCollabServer({
    databaseConfig,
    userService: user_service_1.userService
});
server.applyConfig(file_service_1.setupFileService);
server.start(exports.serverPort);
//# sourceMappingURL=server.js.map