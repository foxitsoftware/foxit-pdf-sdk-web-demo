const koa = require('koa');
const { koaBody } = require('koa-body');
const koaStatic = require('koa-static');
const Router = require('koa-router');
const cors = require('koa2-cors');
const router = new Router();
const app = new koa();
const { fork } = require('child_process');
const path = require('path');
const {
  saveFile,
  getStaticFileRoot,
  getUploadDir,
  getSrcFileAbsolutePath,
  getOutputFileAbsolutePath,
  getFileRelativePath,
} = require('./file-service');
const { convert, getFileExtensionByConvertType } = require('./conversion-service');

app.use(
  cors({
    origin: '*',
    // origin: 'http://localhost:8080',
    maxAge: 2592000,
    credentials: true,
  }),
);

app.use(koaStatic(getStaticFileRoot()));

app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: getUploadDir(),
      keepExtensions: true,
    },
  }),
);

router.post('/api/upload', async (ctx) => {
  const file = ctx.request.files.file;
  try {
    const docId = await saveFile(file.newFilename);
    ctx.body = { docId: `${docId}` };
  } catch (e) {
    ctx.body = { code: 400, msg: `File upload failed: ${e.message}` };
  }
});

router.post('/api/convert', async (ctx) => {
  let {
    docId: srcFileRelativePath,
    type: convertType,
    UseAIRecognize = false,
    password = '',
  } = ctx.request.body;
  let srcFilePath = getSrcFileAbsolutePath(srcFileRelativePath);
  let outputFilePath = getOutputFileAbsolutePath(getFileExtensionByConvertType(convertType));
  let outputFileRelativePath = getFileRelativePath(outputFilePath);
  try {
    console.log(
      `start convert ${srcFileRelativePath} to ${outputFileRelativePath},  UseAIRecognize: ${UseAIRecognize}`,
    );

    // run conversion in a child process to avoid blocking the main thread
    const child = fork(path.join(__dirname, 'conversion-worker.js'), [
      JSON.stringify({
        srcFilePath,
        outputFilePath,
        password,
        convertType,
        UseAIRecognize,
      }),
    ]);
    const conversionPromise = new Promise((resolve, reject) => {
      child.on('message', (message) => {
        if (message === 'conversionFinished') {
          resolve(message);
        } else {
          reject(new Error(message));
        }
      });
    });

    // wait for conversion to finish
    await conversionPromise;

    ctx.body = {
      code: 200,
      data: { url: outputFileRelativePath },
    };
  } catch (e) {
    ctx.body = { code: 400, msg: e.message };
  }
});

app.use(router.routes());

const serverPort = process.env['SERVER_PORT'] ? +process.env['SERVER_PORT'] : 8080;
app.listen(serverPort, () => {
  console.log(`Started server on port: ${serverPort} on process: ${process.pid}`);
});
