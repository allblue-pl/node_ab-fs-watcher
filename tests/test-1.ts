import fs from "node:fs";
import path from "node:path";

import abFSWatcher from "../index.ts";

let patterns = [
    './tests/test-1/1.txt',
    './tests/test-1/2.txt',
    './tests/test-1/*.txt',
    // 'tests/test-1'
];

let w = abFSWatcher.watch(patterns, [ 'add', 'unlink' ], (fsPath, eventType) => {
    let filePaths = w.getFSPaths();
    for (let i = 0; i < filePaths.length; i++)
        filePaths[i] = path.relative(__dirname, filePaths[i]);
    console.log(eventType, fsPath);
});


console.log('Start');

setTimeout(() => {
    fs.mkdirSync('./tests/test-1');
    fs.writeFileSync('./tests/test-1/3.txt', '');
}, 1000);

setTimeout(() => {
    fs.writeFileSync('./tests/test-1/2.txt', '');
}, 2000);

setTimeout(() => {
    fs.writeFileSync('./tests/test-1/1.txt', '');
}, 3000);

setTimeout(() => {
    w.finish();

    fs.unlinkSync('./tests/test-1/1.txt');
    fs.unlinkSync('./tests/test-1/2.txt');
    fs.unlinkSync('./tests/test-1/3.txt');
    fs.rmdirSync('./tests/test-1');

    console.log('End');
}, 6000);
