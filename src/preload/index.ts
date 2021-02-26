import extract from 'extract-zip';
import {
  mkdirSync,
  readFileSync,
  rmdirSync,
  writeFileSync,
  createWriteStream,
  createReadStream,
  readdirSync,
} from 'fs';
import { JSONPath } from 'jsonpath-plus';
import archiver from 'archiver';
import path from 'path';
import parse from 'csv-parse';
import convert from 'xml-js';

const extractPowerpointFile = async (fileName: string, tokenFileName: string) => {
  const { dir, name, ext } = path.parse(fileName);

  const tokens: string[][][] = await parseTokenFile(tokenFileName);

  for (const i of tokens) {
    const extractDir = path.join(dir, name + '-temp-' + i[0][1]);
    mkdirSync(extractDir);
    await extract(fileName, { dir: extractDir });

    const slideDirectory = path.join(extractDir, 'ppt', 'slides');

    const files: string[] = readdirSync(slideDirectory)
      .filter((file) => {
        const { ext } = path.parse(file);
        return ext === '.xml';
      })
      .map((file) => {
        return path.join(slideDirectory, file);
      });

    for (const pptFile of files) {
      const data = readFileSync(pptFile, 'utf-8');

      const result = convert.xml2json(data);
      const obj = JSON.parse(result);

      replaceText(obj, i, '$..elements[?(@.name=="a:t")]..elements[?(@.type=="text")]');
      const xml = convert.json2xml(obj);

      writeFileSync(pptFile, xml);
    }

    await zipWordDocumentFileFromFolder(extractDir, path.join(dir, name + '-' + i[0][1] + ext));
    rmdirSync(extractDir, { recursive: true });
  }
};

const extractDocFile = async (fileName: string, tokenFileName: string) => {
  const { dir, name, ext } = path.parse(fileName);

  const tokens: string[][][] = await parseTokenFile(tokenFileName);

  for (const i of tokens) {
    const extractDir = path.join(dir, name + '-temp-' + i[0][1]);
    const documentFile = path.join(extractDir, 'word', 'document.xml');

    mkdirSync(extractDir);
    await extract(fileName, { dir: extractDir });

    const data = readFileSync(documentFile, 'utf-8');

    const result = convert.xml2json(data);
    const obj = JSON.parse(result);

    replaceText(obj, i, '$..elements[?(@.name=="w:t")]..elements[?(@.type=="text")]');
    const xml = convert.json2xml(obj);
    writeFileSync(documentFile, xml);
    await zipWordDocumentFileFromFolder(extractDir, path.join(dir, name + '-' + i[0][1] + ext));
    rmdirSync(extractDir, { recursive: true });
  }
};

interface ComplexNode {
  type: string;
  text: string;
}

const replaceText = (result: JSON, token: string[][], pattern: string) => {
  const nodes: ComplexNode[] = JSONPath({ path: pattern, json: result });

  const searchTokens = token.map((t) => {
    return t[0];
  });

  nodes
    .filter((node) => {
      let tokenFound = false;

      for (const t of searchTokens) {
        tokenFound = tokenFound || node.text.includes(t);
      }
      return tokenFound;
    })
    .forEach((node) => {
      for (const t of token) {
        node.text = node.text.replace(t[0], t[1]);
      }
    });
};

const zipWordDocumentFileFromFolder = (
  oldFolderPath: string,
  newFilePath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(newFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    archive.on('error', function (err) {
      reject(err);
    });

    archive.pipe(output);

    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve();
    });

    archive.directory(oldFolderPath, false);
    archive.finalize();
  });
};

const convertCsvToArray = (data: any): string[][][] => {
  return data.map((datum: any) => {
    return Object.keys(datum).map((key) => {
      return [key, datum[key]];
    });
  });
};

const parseTokenFile = (tokenFileName: string): Promise<string[][][]> => {
  return new Promise((resolve) => {
    const parser = parse(
      { delimiter: ',', columns: true, skip_empty_lines: true },
      function (err, data) {
        const arrayData = convertCsvToArray(data);
        resolve(arrayData);
      }
    );

    createReadStream(tokenFileName).pipe(parser);
  });
};

process.once('loaded', () => {
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.action === 'EXTRACT_FILE') {
      const { fileName, tokenFileName } = message.payload;

      if (!fileName) {
        return;
      }

      const { ext } = path.parse(fileName);

      if (ext == '.docx') {
        extractDocFile(fileName, tokenFileName);
      }
      if (['.potx', '.pptx'].includes(ext)) {
        extractPowerpointFile(fileName, tokenFileName);
      }
    }
  });
});
