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
const { getTaskInfo, startTask, updateTaskAccessTimestamp } = require('./task');

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
    page_range = '',
    include_pdf_comments = true,
    include_images = true,
    enable_retain_page_layout = false,
    workbook_settings = 2, // 0: SeparateWorkbook 1: EachTable, 2: EachPage,  
    is_embed_font = false,
    is_generate_bookmark = false,
    is_separate_workbook = false,
    is_output_hidden_worksheets = false,
    worksheet_names = '',
    password = '',
  } = ctx.request.body;
  let srcFilePath = getSrcFileAbsolutePath(srcFileRelativePath);
  let outputFilePath = getOutputFileAbsolutePath(getFileExtensionByConvertType(convertType));
  let outputFileRelativePath = getFileRelativePath(outputFilePath);
  console.log(
    `start convert ${srcFileRelativePath} to ${outputFileRelativePath},  UseAIRecognize: ${UseAIRecognize}`,
  );

  const params = {
    pdf2office: {
      enable_ml_recognition : UseAIRecognize,
      page_range : page_range,
      include_pdf_comments : include_pdf_comments,
      include_images : include_images,
      pdf2word: {
        enable_retain_page_layout: enable_retain_page_layout,
      },
      pdf2excel: {
        workbook_settings : workbook_settings,
      },
    },
    office2pdf: {
      is_embed_font  : is_embed_font,
      word2pdf: {
        is_generate_bookmark : is_generate_bookmark,
      },
      excel2pdf: {
        is_separate_workbook : is_separate_workbook,
        is_output_hidden_worksheets : is_output_hidden_worksheets,
        worksheet_names  : worksheet_names,
      },
    }
  };

  const taskId = startTask(outputFileRelativePath, {
    srcFilePath,
    outputFilePath,
    password,
    convertType,
    params,
  });

  ctx.body = {
    code: 200,
    data: { url: taskId },
  };
});

router.post('/api/convert/status', async (ctx) => {
  const { taskId } = ctx.request.body;
  const taskInfo = getTaskInfo(taskId);
  updateTaskAccessTimestamp(taskId);
  ctx.body = {
    code: 200,
    data: taskInfo,
  };
});

app.use(router.routes());

const serverPort = process.env['SERVER_PORT'] ? +process.env['SERVER_PORT'] : 19113;
app.listen(serverPort, () => {
  console.log(`Started server on port: ${serverPort} on process: ${process.pid}`);
});
