import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import abFSWatcher from "../ts-lib/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let patterns = [
    path.resolve('./tests/b/**/*.js'),
];

let w = abFSWatcher.watch(patterns, [ 'add', 'unlink', 'change' ], (fsPath, eventType) => {
    let filePaths = w.getFSPaths();
    for (let i = 0; i < filePaths.length; i++)
        filePaths[i] = path.relative(__dirname, filePaths[i]);

    console.log("Result", fsPath);
}, (fsPath) => {
    let ignorePath = path.resolve("./tests/b/c") + path.sep;

    console.log(fsPath, ignorePath, fsPath.startsWith(ignorePath));
    if (fsPath.startsWith(ignorePath))
        return true;

    return false;
});