const koa = require('koa');
const { koaBody } = require('koa-body');
const koaStatic = require('koa-static');
const Router = require('koa-router');
const cors = require('koa2-cors');
const router = new Router();
const app = new koa();
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
    const abortFn = await convert(
      srcFilePath,
      outputFilePath,
      password,
      convertType,
      UseAIRecognize,
    );
    ctx.req.on('close', () => {
      console.log('request closed, abort conversion of file: ', srcFileRelativePath);
      abortFn();
    });
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
  console.log(`Started server on port: ${serverPort}`);
});
