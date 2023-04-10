

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
    State, ErrorCode
} = require('./conversionSdk/pdfToOffice.js');
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
        uploadDir: getDateFolderToday(),
        keepExtensions: true,
        onFileBegin: () => {
            const folder = getDateFolderToday();
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
    let docId=basename.replace('.pdf', '')
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
    let src_pdf_path = path.join(__dirname, 'static/fileUploads/' + getDateDirName() + '/') + `${docId}.pdf`
    console.log(src_pdf_path)
    let output = path.join(__dirname, 'static/fileOutput/' + getDateDirName() + '/')
    console.log(output)
    if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
    }
    let setting_data = new PDF2OfficeSettingData(path.join(__dirname, 'metrics_data'), AIRecognize);
    let saved_file_path;
    let save_doc_id;
    if (convertType === 200) {
        const current_time = new Date().getTime().toString();
        save_doc_id = uuidv4() + '_' + current_time;
        saved_file_path = output + save_doc_id + '.docx'
        if (fs.existsSync(saved_file_path)) {
            try {
              fs.unlinkSync(saved_file_path);
              console.log('remove file success %s', saved_file_path);
            } catch (err) {
              console.error('remove file failed %s', saved_file_path);
            }
        }
        try {
            let progressive = PDF2Office.StartConvertToWordWithPath(src_pdf_path, passwordValue, saved_file_path, setting_data, custom_callback);
            if (progressive.GetRateOfProgress() != 100) {
                var state = State.e_ToBeContinued;
                while (State.e_ToBeContinued == state) {
                      state = progressive.Continue();
                  }
            }
          console.log("Convert PDF file to Word format file with path.");
        } catch (e) {
            return throwError(e,ctx)   
        }
    } else if (convertType === 201) {
        const current_time = new Date().getTime().toString();
        save_doc_id = uuidv4() + '_' + current_time;
        saved_file_path = output + save_doc_id + '.xlsx'
        if (fs.existsSync(saved_file_path)) {
            try {
              fs.unlinkSync(saved_file_path);
              console.log('remove file success %s', saved_file_path);
            } catch (err) {
              console.error('remove file failed %s', saved_file_path);
            }
        }
        try {
            var progressive = PDF2Office.StartConvertToExcelWithPath(src_pdf_path, passwordValue, saved_file_path, setting_data, custom_callback);
            if (progressive.GetRateOfProgress() != 100) {
                var state = State.e_ToBeContinued;
                while (State.e_ToBeContinued == state) {
                    state = progressive.Continue();
                }
            }
            console.log("Convert PDF file to excel format file with path.");
        } catch (e) {
            return throwError(e,ctx)   
        }
    } else if (convertType === 202) {
        const current_time = new Date().getTime().toString();
        save_doc_id = uuidv4() + '_' + current_time;
        saved_file_path = output + save_doc_id + '.pptx'
        if (fs.existsSync(saved_file_path)) {
            try {
              fs.unlinkSync(saved_file_path);
              console.log('remove file success %s', saved_file_path);
            } catch (err) {
              console.error('remove file failed %s', saved_file_path);
            }
        }
        try {
            var progressive = PDF2Office.StartConvertToPowerPointWithPath(src_pdf_path, passwordValue, saved_file_path, setting_data, custom_callback);
            if (progressive.GetRateOfProgress() != 100) {
                var state = State.e_ToBeContinued;
                while (State.e_ToBeContinued == state) {
                    state = progressive.Continue();
                }
            }
            console.log("Convert PDF file to ppt format file with path.");
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