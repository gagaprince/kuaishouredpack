import { Injectable } from '@nestjs/common';
const path = require('path');
const fs = require('fs');

@Injectable()
export class SourceScriptService {
    private source: string;
    async loadFromFile(isUpdate?: boolean): Promise<string> {
        if (!isUpdate && this.source) {
            return this.source;
        }
        const dir = path.resolve(process.cwd(), '..', 'fridaScript/dist/index.bundle.js');
        console.log(dir);
        try {
            const source = fs.readFileSync(dir, "utf8");
            this.source = source;
            return source;
        } catch (e) {
            console.log(e);
        }
        return '';
    }
    // async loadFromUrl() { }
}