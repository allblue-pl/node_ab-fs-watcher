import path from "node:path";
import anymatch from "anymatch";
export default class Pattern {
    #depth;
    #fsPattern;
    #watchedPattern;
    get depth() {
        return this.#depth;
    }
    get fsPattern() {
        return this.#fsPattern;
    }
    get watchedPattern() {
        return this.#watchedPattern;
    }
    constructor(fsPattern) {
        this.#fsPattern = path.resolve(fsPattern).replace(/\\/g, "/");
        let fsPatternArray = this.#fsPattern.split('/');
        let helperPatternArray = [fsPatternArray[0]];
        let depth = 0;
        for (let i = 1; i < fsPatternArray.length - 1; i++) {
            if (fsPatternArray[i] === "*") {
                depth = fsPatternArray.length - i;
                break;
            }
            else if (fsPatternArray[i] === "**") {
                depth = -1;
                break;
            }
            helperPatternArray.push(fsPatternArray[i]);
        }
        this.#depth = depth;
        this.#watchedPattern = helperPatternArray.join('/');
    }
    matches(fsMatch) {
        if (anymatch([this.#fsPattern], fsMatch))
            return true;
        return false;
    }
    matchesDir(fsMatch) {
        let fsPatternArr = this.#fsPattern.split("/");
        let fsMatchArr = fsMatch.split("/");
        fsPatternArr = fsPatternArr.slice(0, fsMatchArr.length);
        for (let i = 0; i < fsPatternArr.length; i++) {
            if (fsPatternArr[i] === "**") {
                fsPatternArr = fsPatternArr.slice(0, i + 1);
                break;
            }
        }
        if (anymatch([fsPatternArr.join("/")], fsMatch))
            return true;
        return false;
    }
}
