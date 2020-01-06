'use strict';

const
    anymatch = require('anymatch'),
    path = require('path'),

    Watcher = require('./Watcher')
;


Object.defineProperty(Watcher, 'Pattern', { value:
class Watcher_Pattern {

    constructor(fsPatterns)
    {
        fsPatterns = fsPatterns.replace(/\\/g, /\//);

        this._fsPattern = path.resolve(fsPatterns);
        this._helperPatterns = new Set();

        let watch_pattern_array = fsPatterns.split('/');
        if (watch_pattern_array.length > 1) {
            if (watch_pattern_array[0] !== '*' && watch_pattern_array[0] !== '**') {
                watch_pattern_array[0] = '*';
                this._helperPatterns.add(path.resolve(watch_pattern_array.join('/')));
            }
        }
    }

    getWatchedPatterns()
    {
        let watchedPatterns = Array.from(this._helperPatterns);
        watchedPatterns.push(this._fsPattern);

        return watchedPatterns;
    }

    matches(fsMatch)
    {
        if (anymatch([ this._fsPattern ], fsMatch))
            return true;

        return false;
    }

}});
module.exports = Watcher.Pattern;
