import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import abFSWatcher from "../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let patterns = [
    path.resolve('./tests/b/c/*.js'),
];

let w = abFSWatcher.watch(patterns, [ 'add', 'unlink', 'change' ], (fsPath, eventType) => {
    let filePaths = w.getFSPaths();
    for (let i = 0; i < filePaths.length; i++)
        filePaths[i] = path.relative(__dirname, filePaths[i]);
    console.log(eventType, fsPath);
});