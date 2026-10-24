// Appends the NOTICE file of every bundled package that ships one to
// dist/licenses.txt. ncc writes licence texts only; Apache-2.0 section 4(d)
// also requires redistributing the NOTICE contents.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const LICENSES_FILE = path.join(ROOT, 'dist', 'licenses.txt');
const NOTICE_FILE_NAMES = ['NOTICE', 'NOTICE.txt', 'NOTICE.md'];

// ncc writes each entry as "<package name>\n<license id>\n<license text>",
// with entries separated by a blank line.
const isPackageNameLine = (line, index, lines) =>
  /^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(line) &&
  (index === 0 || lines[index - 1] === '') &&
  /^[A-Za-z0-9.+()\- ]+$/.test(lines[index + 1] || '');

const findNotice = (packageName) =>
  NOTICE_FILE_NAMES.map((fileName) =>
    path.join(ROOT, 'node_modules', packageName, fileName)
  ).find((filePath) => fs.existsSync(filePath));

const licenses = fs.readFileSync(LICENSES_FILE, 'utf8');
const lines = licenses.split('\n');
const packageNames = lines.filter(isPackageNameLine);

const notices = packageNames
  .map((packageName) => ({ noticePath: findNotice(packageName), packageName }))
  .filter(({ noticePath }) => noticePath)
  .map(
    ({ packageName, noticePath }) =>
      `${packageName} NOTICE\n\n${fs.readFileSync(noticePath, 'utf8').trim()}\n`
  );

if (notices.length > 0) {
  fs.appendFileSync(
    LICENSES_FILE,
    `\nNOTICE files of bundled packages\n\n${notices.join('\n')}`
  );
}
