const { convert } = require('./conversion-service');

const [convertParams] = process.argv.slice(2);
const { srcFilePath, outputFilePath, password, convertType, UseAIRecognize } =
  JSON.parse(convertParams);

async function startConversion() {
  console.log('conversion started on process: ', process.pid);
  await convert(srcFilePath, outputFilePath, password, convertType, UseAIRecognize);
}

startConversion()
  .then(() => {
    console.log('conversion finished on process: ', process.pid);
    process.send(
      JSON.stringify({
        status: 'finished',
      }),
    );
    process.exit(0);
  })
  .catch((e) => {
    console.log('conversion failed on process: ', process.pid, e.message);
    process.send(
      JSON.stringify({
        status: 'error',
        error: e.message,
      }),
    );
    process.exit(1);
  });

process.on('exit', (code) => {
  console.log(`conversion exited with code ${code}`);
});
