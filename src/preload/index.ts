import extract from 'extract-zip';
import {
  mkdirSync,
  readFileSync,
  rmdirSync,
  writeFileSync,
  createWriteStream,
  createReadStream,
} from 'fs';
import xml2js from 'xml2js';
import { JSONPath } from 'jsonpath-plus';
import archiver from 'archiver';
import path from 'path';
import parse from 'csv-parse';

console.log('Preload Code Goes Here');

const extractDocFile = async (fileName: string, tokenFileName: string) => {
  if (!fileName) {
    return;
  }

  console.log('New File uploaded ', fileName);

  const { dir, name, ext } = path.parse(fileName);

  const tokens: string[][][] = await parseTokenFile(tokenFileName);

  for (const i of tokens) {
    const extractDir = path.join(dir, name + '-temp-' + i[0][1]);
    const documentFile = path.join(extractDir, 'word', 'document.xml');

    mkdirSync(extractDir);
    await extract(fileName, { dir: extractDir });

    const data = readFileSync(documentFile, 'utf-8');

    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder();

    const result = await parser.parseStringPromise(data);
    replaceText(result, i);
    const xml = builder.buildObject(result);
    writeFileSync(documentFile, xml);
    await zipWordDocumentFileFromFolder(extractDir, path.join(dir, name + '-' + i[0][1] + ext));
    rmdirSync(extractDir, { recursive: true });
  }
};

interface ComplexNode {
  $: JSON;
  _: string;
}

function isStringNode(node: string | ComplexNode): node is string {
  return (node as string).includes !== undefined;
}

const replaceText = (result: JSON, token: string[][]) => {
  const nodes: (string | ComplexNode)[][] = JSONPath({ path: '$..w:t', json: result });

  const searchTokens = token.map((t) => {
    return t[0];
  });

  nodes
    .filter((node) => {
      let tokenFound = false;
      console.log(node);

      for (const t of searchTokens) {
        if (isStringNode(node[0])) {
          tokenFound = tokenFound || node[0].includes(t);
        } else {
          tokenFound = tokenFound || node[0]['_'] ? node[0]['_'].includes(t) : false;
        }
      }
      return tokenFound;
    })
    .forEach((node) => {
      for (const t of token) {
        if (isStringNode(node[0])) {
          node[0] = node[0].replace(t[0], t[1]);
        } else {
          node[0]['_'] = node[0]['_'].replace(t[0], t[1]);
        }
      }
      return node;
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
        console.log('data', data);
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
      extractDocFile(message.payload.fileName, message.payload.tokenFileName);
    }
  });
});
