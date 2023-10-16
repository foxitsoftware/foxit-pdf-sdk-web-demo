const koa = require('koa')
const {koaBody} = require('koa-body')
const koaStatic = require('koa-static')
const Router = require('koa-router')
const cors = require('koa2-cors');
const path = require('path')
const fs = require('fs')
const {
    initConversionSdk,
    PDF2Office,
    PDF2OfficeSettingData,
    custom_callback,
    PDF2WordSettingData,
    Range,
    State, ErrorCode
} = require('./conversionSdk/pdfToOffice.js');

// a map from conversion type to conversion config
const conversionTypeMap = {
    200: {
        type: 200,
        fileExtension: 'docx',
        fileType: 'Word',
        method: 'StartConvertToWordWithPath',
    },
    201: {
        type: 201,
        fileExtension: 'xlsx',
        fileType: 'Excel',
        method: 'StartConvertToExcelWithPath',
    },
    202: {
        type: 202,
        fileExtension: 'pptx',
        fileType: 'PPT',
        method: 'StartConvertToPowerPointWithPath',
    }

}

const router = new Router()
const app = new koa()
const { v4: uuidv4 } = require('uuid');
app.use(cors({
  origin:"*",
  // origin: 'http://localhost:8080',
  maxAge: 2592000,
  credentials: true
}));
app.use(koaStatic(path.join(__dirname, 'static')))

const getDateFolderToday = () => path.join(__dirname, 'static/fileUploads/' + getDateDirName())

app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, 'static/fileUploads/'),
        keepExtensions: true,
        onFileBegin: () => {
            const folder = path.join(__dirname, 'static/fileUploads/');
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
            }
        },
    }
}));

function getDateDirName(){
    const date = new Date();
    let month = Number.parseInt(date.getMonth()) + 1;
    month = month.toString().length > 1 ? month : `0${month}`;
    const dir = `${date.getFullYear()}${month}${date.getDate()}`;
    return dir;
}

function throwError(e,ctx){
    let errorMsg=JSON.parse(e.message)
    if (errorMsg.code === ErrorCode.e_ErrUnsupported) {
        return ctx.body = {code: 400, msg: 'Some types are not supported.'}
    } else if (errorMsg.code === ErrorCode.e_ErrPassword) {
        return ctx.body = {code: 406, msg: 'Invalid password.'}
    }else if (errorMsg.code === ErrorCode.e_ErrCertificate) {
        return ctx.body = {code: 400, msg: 'Certificate error.'}
    }else if (errorMsg.code === ErrorCode.e_ErrOutOfMemory ) {
        return ctx.body = {code: 400, msg: 'Out-of-memory error occurs.'}
    }else if (errorMsg.code === ErrorCode.e_ErrParam ) {
        return ctx.body = {code: 400, msg: 'Parameter error.'}
    }
}

initConversionSdk()
router.post('/api/upload', async (ctx) => {
    const file = ctx.request.files.file
    const basename = path.basename(file.newFilename)
    const parentDir = getDateDirName()
    const fullPath = path.join(__dirname, 'static/fileUploads/' + parentDir)
    try {
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath);
        }
        fs.renameSync(path.join(__dirname, 'static/fileUploads/', file.newFilename), path.join(fullPath, file.newFilename))
    } catch (e) {
        return ctx.body = {code: 400, msg: `Upload faild, ${e.message}`}
    }

    const docId = parentDir + '/' + basename.replace('.pdf', '')
    ctx.body = { "docId": `${docId}` }
})

router.post('/api/convert', (ctx) => {
    let docId = ctx.request.body.docId
    let convertType = ctx.request.body.type
    let UseAIRecognize = ctx.request.body.UseAIRecognize
    let AIRecognize;
    let password = ctx.request.body.password;
    let passwordValue='';
    if (password!=='') {
        passwordValue=password
    }
    if (UseAIRecognize===true) {
        AIRecognize=true
    } else {
        AIRecognize=false
    }
    let src_pdf_path = path.join(__dirname, 'static/fileUploads/', `${docId}.pdf`)
    console.log(src_pdf_path)
    let output = path.join(__dirname, 'static/fileOutput/' + getDateDirName() + '/')
    console.log(output)
    if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
    }

    let word_setting_data = new PDF2WordSettingData(true);
    var range = new Range();
    let setting_data = new PDF2OfficeSettingData(path.join(__dirname, 'metrics_data'), AIRecognize, range, true, word_setting_data);
    let saved_file_path;
    let save_doc_id;

    const convertConfig = conversionTypeMap[convertType]
    if (convertConfig) {
        const current_time = new Date().getTime().toString();
        save_doc_id = uuidv4() + '_' + current_time;
        saved_file_path = output + save_doc_id + '.' + convertConfig.fileExtension;
        if (fs.existsSync(saved_file_path)) {
            try {
              fs.unlinkSync(saved_file_path);
              console.log('remove file success %s', saved_file_path);
            } catch (err) {
              console.error('remove file failed %s', saved_file_path);
            }
        }
        try {
            let progressive = PDF2Office[convertConfig.method](src_pdf_path, passwordValue, saved_file_path, setting_data, custom_callback);
            if (progressive.GetRateOfProgress() != 100) {
                var state = State.e_ToBeContinued;
                while (State.e_ToBeContinued == state) {
                      state = progressive.Continue();
                  }
            }
            console.log(`Convert PDF file to ${convertConfig.fileType} format file with path.`);
        } catch (e) {
            return throwError(e,ctx)
        }
    }
    ctx.body = { code: 200, data: { "url": save_doc_id } }

})
app.use(router.routes());

app.listen(process.env['SERVER_PORT'] ? +process.env['SERVER_PORT'] : 8080, () => {
    console.log('start success')
    console.log(process.env['SERVER_PORT'] ? +process.env['SERVER_PORT'] : 8080)
});
