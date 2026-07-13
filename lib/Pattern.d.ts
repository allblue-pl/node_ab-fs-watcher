export default class Pattern {
    #private;
    get fsPattern(): string;
    get watchedPattern(): string;
    constructor(fsPattern: string);
    matches(fsMatch: string): boolean;
    matchesDir(fsMatch: string): boolean;
}
