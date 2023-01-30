const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Define the folder paths
const srcFolder = path.join(__dirname, '..', 'input');
const dstFolder = path.join(__dirname, '..', 'output');

// Check if destination folder exists
if (!fs.existsSync(dstFolder)) {
  // Create the new folder
  fs.mkdirSync(dstFolder);
}

function dataRegex(data) {
  data = data.replace(/\r/g, '');
  const regex = new RegExp('^---\n((?:.|\n)*?)\n---\n', 'm');
  let result = data.match(regex);

  if (result === null) {
    console.log('no yaml');
  } else {
    console.log('yaml', yaml.load(result[1]));
  }

  return 'text';
}

// Read the contents of the source folder
function targetFolder(inSrcFolder, inDstFolder) {
  fs.readdir(inSrcFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file) => {
      const srcFile = path.join(inSrcFolder, file);
      const dstFile = path.join(inDstFolder, file);

      // 폴더인지 파일인지 확인
      if (fs.lstatSync(srcFile).isDirectory()) {
        // 폴더인데 없으면 만들기
        if (!fs.existsSync(dstFile)) {
          fs.mkdirSync(dstFile);
        }
        // 폴더 안에 있는 파일들 대상으로 재귀호출
        targetFolder(srcFile, dstFile);
      } else {
        // 임시 파일이면 제외
        const ignoreFiles = ['.DS_Store', 'Thumbs.db', 'desktop.ini', 'Icon?'];
        if (ignoreFiles.includes(file)) {
          return;
        }
        if (!file.endsWith('.md')) {
          // 임시파일이 아닌 파일은 카피해서 넣기
          fs.copyFileSync(srcFile, dstFile);
          return;
        }
        fs.readFile(srcFile, 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            return;
          }

          // Modify the file contents
          let modifiedData = dataRegex(data);

          // Write the modified contents to the destination file
          fs.writeFile(dstFile, modifiedData, (err) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`File ${file} was copied and modified successfully!`);
          });
        });
      }
    });
  });
}

targetFolder(srcFolder, dstFolder);
