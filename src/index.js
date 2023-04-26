const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Define the folder paths
const srcFolder = path.join(__dirname, '../../../', 'src/contents');
const dstFolder = path.join(__dirname, '../../', 'docs');

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
    // console.log('no yaml');
  } else {
    // console.log('yaml', yaml.load(result[1]));
  }

  return data;
}

const startsValidate = (str) => {
  arr = ['.', '_'];
  return arr.some((text) => str.startsWith(text));
};

const endsValidate = (str) => {
  arr = [
    '.ts',
    '.tsx',
    '.canvas',
    '.js',
    '.jsx',
    '.json',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.html',
    'csv',
  ];
  return arr.some((text) => str.endsWith(text));
};
const ignoreFiles = [
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  'index.tsx',
  '.obsidian',
];

const nameValidate = (str) => {
  return ignoreFiles.some((text) => str.endsWith(text));
};

// Read the contents of the source folder
function targetFolder(inSrcFolder, inDstFolder) {
  fs.readdir(inSrcFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file) => {
      // console.log('🚀 ~ file: index.js:48 ~ files.forEach ~ file:', file);
      const srcFile = path.join(inSrcFolder, file);
      const dstFile = path.join(inDstFolder, file);

      // 폴더인지 파일인지 확인
      if (fs.lstatSync(srcFile).isDirectory()) {
        // 폴더인데 없으면 만들기
        if (!fs.existsSync(dstFile)) {
          // 특정 이름의 폴더 생성도 제외
          console.log('dstFile', dstFile);
          if (nameValidate(dstFile)) {
            console.log('특정 파일 제거', dstFile);
            return;
          }
          fs.mkdirSync(dstFile);
        }
        // 폴더 안에 있는 파일들 대상으로 재귀호출
        targetFolder(srcFile, dstFile);
      } else {
        // 임시 파일이면 제외

        if (
          ignoreFiles.includes(file) ||
          file.startsWith('.') ||
          endsValidate(file) ||
          startsValidate(file)
        ) {
          console.log(`File ${file} was ignored!`);
          return;
        }
        // 파일명이 .으로 시작하면 제외

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
            // console.log(`File ${file} was copied and modified successfully!`);
          });
        });
      }
    });
  });
}

targetFolder(srcFolder, dstFolder);
