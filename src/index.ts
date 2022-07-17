import * as fs from "fs/promises";
import * as path from "path";

const dirPath = "./target";
const targetPathReg = /.*\.html$/;
const excludePathReg = /^(?!.*(ssi|styleguide-dev)).+$/;

// ページリスト
const getPagePathList = async () => {
  const pagePaths: string[] = [];

  const showHtmlFiles = async (dirPath: string) => {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const fp = path.join(dirPath, file);
      const stat = await fs.stat(fp);

      if (stat.isDirectory()) {
        await showHtmlFiles(fp);
      } else {
        if (targetPathReg.test(fp)) {
          if (excludePathReg.test(fp)) {
            const splitPath = fp.split("/");
            splitPath.shift();
            const formatPath = splitPath.join("/");
            pagePaths.push(formatPath);
          }
        }
      }
    }
  };

  await showHtmlFiles(dirPath);
  console.log(pagePaths);

  return pagePaths;
};

// ページリストHTMLの作成
const createHtml = (pageList: string[]) => {
  const tags = pageList.map((path) => {
    return `
      <li>
        <a href="/${path}">/${path}</a>
      </li>
    `;
  });
  return `
  <ul>
    ${tags.join("")}
  </ul>

`;
};

// ファイルの生成
const writePageListFiles = async () => {
  const pageLists = await getPagePathList();
  const formatPageList = pageLists.map((path) => {
    return {
      path: path,
    };
  });

  const pageListHtml = createHtml(pageLists);
  await fs.writeFile("pageList.json", JSON.stringify(formatPageList));
  await fs.writeFile("pageList.html", pageListHtml);
};

writePageListFiles();
