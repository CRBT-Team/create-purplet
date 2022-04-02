import fs, { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const { devDependencies: deps } = JSON.parse(
  fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8')
);

export const createPurplet = async (dir, options) => {
  fs.mkdirSync(dir, { recursive: true });

  try {
    const templateDir = fileURLToPath(
      new URL(`./templates/blank`, import.meta.url).href
    );
    copyFiles(dir, templateDir);
  } catch (e) {
    throw new Error(e);
  }
};

const copyFiles = (dir, templateDir) => {
  const files = fs.readdirSync(templateDir);

  const ignored = fs
    .readFileSync(
      fileURLToPath(new URL(`./templates/blank/.ignore`, import.meta.url)),
      'utf-8'
    )
    .split('\r\n');

  files.forEach((file) => {
    const filePath = path.join(templateDir, file);
    const fileName = path.basename(filePath);

    if (ignored.includes(fileName)) {
      return;
    }
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.mkdirSync(path.join(dir, fileName), { recursive: true });
      copyFiles(path.join(dir, fileName), filePath);
      return;
    }

    if (fileName === 'package.template.json') {
      const pjson = JSON.parse(readFileSync(filePath, 'utf-8'));
      pjson.name = dir;
      pjson.dependencies = {
        ['purplet']: deps.purplet,
        ['discord.js']: deps['discord.js'],
      };
      fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify(pjson, null, 2)
      );
      return;
    }
    fs.copyFileSync(filePath, path.join(dir, fileName));
  });
};
