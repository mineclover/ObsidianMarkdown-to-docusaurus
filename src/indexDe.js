const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Define the folder paths
const srcFolder = path.join(__dirname, '../../', 'src/contents');
const dstFolder = path.join(__dirname, '../../docusaurus/', 'docs');
const base = path.join(__dirname, '../../', 'src');
const router = path.join(__dirname, '../../', 'src/router', 'router.json');
const markdown = [];

const saveJson = (router, markdown) => {
  const json = JSON.stringify(markdown);

  try {
    fs.accessSync(router);
    fs.unlinkSync(router);
    console.log(`${router} is deleted`);
  } catch (err) {
    console.error('없는 파일');
  }

  fs.writeFile(router, json, 'utf8', (err) => {
    if (err) throw err;
    console.log('Data written to file');
    console.timeEnd('test');
  });
};

const real = debounce(saveJson, 1000);

console.log(base);

if (!fs.existsSync(dstFolder)) {
  // Create the new folder
  fs.mkdirSync(dstFolder);
} else {
  // 없으면 삭제
}
// 1. 기존 파일 삭제
fs.rmSync(dstFolder, { recursive: true });

// 2. 기존 파일이 있으면 삭제 저장할 파일 생성 docs
if (!fs.existsSync(dstFolder)) {
  // Create the new folder
  fs.mkdirSync(dstFolder);
} else {
  // 없으면 삭제
}

// yaml 데이터 정규식으로 추출하는 메서드
function dataRegex(data) {
  const temp = data.replace(/\r/g, '');
  const regex = /^---\n((?:.|\n)*?)\n---\n/m;
  const result = temp.match(regex);

  if (result === null) {
    // console.log('no yaml');
  } else {
    // console.log('yaml', yaml.load(result[1]));
  }

  return temp;
}

// 앞글자 포함시 생략
const startsValidate = (str) => {
  arr = ['.', '_'];
  return arr.some((text) => str.startsWith(text));
};

// 뒷글자 포함시 생략
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
    '.csv',
  ];
  return arr.some((text) => str.endsWith(text));
};

// 삭제해야할 특정 파일 또는 폴더 이름, 공유해서 쓰고 있음
const ignoreFiles = [
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  'index.tsx',
  '.obsidian',
  'dev-softer',
];

// 전체 경로에서 파일 이름을 찾는 메서드
const nameValidate = (str) => {
  return ignoreFiles.some((text) => str.endsWith(text));
};

// 타겟 폴더를 찾는 재귀함수 메서드
function targetFolder(inSrcFolder, inDstFolder) {
  inDstFolder = inDstFolder.replaceAll(/ /g, '+');
  // 복제할 파일을 읽음
  fs.readdir(inSrcFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    // 파일들을 순회
    const pathTest = `${inDstFolder}\\_category_.yml`;
    const fileName = inDstFolder.split('\\').pop();
    const yamlContent = yaml.dump({
      label: fileName,
      collapsible: true,
      collapsed: false,
      link: {
        type: 'generated-index',
        title: `${fileName} index`,
      },
    });
    files.forEach((file) => {
      // 순회해서 조회된 파일들 경로 설정
      const srcFile = path.join(inSrcFolder, file);
      // src는 변경하면 안되고.. dst는 변경, 경로도 변경 필요
      file = file.replaceAll(/ /g, '+');
      let dstFile = path.join(inDstFolder, file);

      // 폴더인지 파일인지 확인
      if (fs.lstatSync(srcFile).isDirectory()) {
        // 폴더인데 dst에 없으면 만들기
        if (!fs.existsSync(dstFile)) {
          // 특정 찾았는데
          if (nameValidate(dstFile)) {
            // 조건 충족 하면 폴더 생성 제외
            return;
          }

          // 현재 위치는 폴더를 만들 때 ~ 추가 조건이 맞으면 동작한다
          fs.mkdirSync(dstFile);
        }
        // 폴더 안에 있는 파일들 대상으로 재귀호출
        targetFolder(srcFile, dstFile);
      } else {
        // 임시 파일이면 제외

        if (
          ignoreFiles.includes(file) ||
          endsValidate(file) ||
          startsValidate(file)
        ) {
          return;
        }

        if (!file.endsWith('.md')) {
          // 임시파일이 아닌 파일은 카피해서 넣기
          fs.copyFileSync(srcFile, dstFile);
          return;
        }
        // 원본 객체 읽기
        fs.readFile(srcFile, 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            return;
          }
          // 원본 객체 복사
          markdown.push(srcFile.replace(base, '..').replace(/\\/g, '/'));
          real(router, markdown);
          const modifiedData = dataRegex(data);
          // 생성
          fs.writeFile(dstFile, modifiedData, (err) => {
            if (err) {
              console.error(err);
            }
            // console.log(`File ${file} was copied and modified successfully!`);
          });
        });

        // 카테고리 생성
        // 현재 file 이 아니거나 현재 위치에 _category_.yml 파일이 없으면 생성

        if (!inDstFolder.endsWith('\\file') && !fs.existsSync(pathTest)) {
          // file 일 경우 생성하지 않음
          // console.log('pathTest', fileName, file);
          if (file === 'file' || file === `${fileName}.md`) {
            // console.log('생성 생략');
            return;
          }
          fs.writeFile(pathTest, yamlContent, (err) => {
            if (err) {
              // console.error(pathTest, yamlContent);
            } else {
              // console.log('pathTest', inDstFolder);
            }
          });
        }
      }
    });
  });
}

console.time('test');
const test = targetFolder(srcFolder, dstFolder);

// const test = targetFolder(srcFolder, dstFolder).then(() => {
//   console.timeEnd('test');
// });

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
