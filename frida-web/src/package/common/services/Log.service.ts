import { Injectable, Scope, Inject, } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
const Debug = require('debug');

// scope request 就是说 每个request 会产生一个新的logService实例 
// 默认是产生单例 
// 引用了这个service的service 也会是 scope request 的
// 这里是为了处理traceId 所以需要这样一个设置
@Injectable({ scope: Scope.REQUEST })
export class LogService {
    private logIns: any;
    constructor(@Inject(REQUEST) private readonly request: any) {
    }

    init(key: string) {
        this.logIns = Debug(key);
    }

    getTraceId(): string {
        return this.request.traceId;
    }

    log(msg) {
        if (this.logIns) {
            this.logIns(`${this.request.traceId}---${msg}`);
        } else {
            throw new Error('Log is not init!');
        }
    }
}