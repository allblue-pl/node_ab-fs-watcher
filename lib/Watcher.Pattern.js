'use strict';

const Watcher = require('./Watcher');

const path = require('path');

const anymatch = require('anymatch');


Object.defineProperty(Watcher, 'Pattern', { value:
class Watcher_Pattern {

    constructor(fs_pattern)
    {
        fs_pattern = fs_pattern.replace(/\\/g, /\//);

        this._fsPattern = path.resolve(fs_pattern);
        this._helperPatterns = new Set();

        let watch_pattern_array = fs_pattern.split('/');
        if (watch_pattern_array.length > 1) {
            if (watch_pattern_array[0] !== '*' && watch_pattern_array[0] !== '**') {
                watch_pattern_array[0] = '*';
                this._helperPatterns.add(path.resolve(watch_pattern_array.join('/')));
            }
        }
    }

    getWatchedPatterns()
    {
        let watched_patterns = Array.from(this._helperPatterns);
        watched_patterns.push(this._fsPattern);

        return watched_patterns;
    }

    matches(fs_path)
    {
        if (anymatch([ this._fsPattern ], fs_path))
            return true;

        return false;
    }

}});
module.exports = Watcher.Pattern;
