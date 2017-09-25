'use strict';

const fs = require('fs');
const path = require('path');

const abFSWatcher = require('ab-fs-watcher');


let patterns = [
    'tests/test-1/1.txt',
    'tests/test-1/2.txt',
    'tests/test-1/*.txt',
];

let w = abFSWatcher.watch(patterns, [ 'add', 'unlink' ], (fs_path, event_type) => {
    let file_paths = w.getFSPaths();
    for (let i = 0; i < file_paths.length; i++)
        file_paths[i] = path.relative(__dirname, file_paths[i]);
    console.log('Files', file_paths);
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

    fs.unlinkSync('./tests/test-1/1.txt', '');
    fs.unlinkSync('./tests/test-1/2.txt', '');
    fs.unlinkSync('./tests/test-1/3.txt', '');
    fs.rmdirSync('./tests/test-1');

    console.log('End');
}, 6000);
