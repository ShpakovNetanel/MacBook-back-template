const archiverModule = require('archiver');
const fs = require('fs');
const path = require('path');

const { ZipArchive } = archiverModule;
const outputPath = path.join(__dirname, 'daba-back.zip');

if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const output = fs.createWriteStream(outputPath);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', () => {
  const mb = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`Created daba-back.zip (${mb} MB)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

archive.glob('**', {
  cwd: __dirname,
  ignore: ['node_modules/**', '.env', 'package-lock.json', '*.zip', 'zip.cjs'],
});

archive.finalize();
