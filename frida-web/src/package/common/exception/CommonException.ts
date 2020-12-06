export enum ErrorCode {
    SCRIPT_ERROR = 100, // 脚本错误
    DEVICE_ERROR,
    PARAMES_ERROR,
    TIME_OUT,
    SCRIPT_WORK_ERROR
}
export const ErrorType = {
    SCRIPT_ERROR: 'fridaScriptError',
    DEVICE_ERROR: 'deviceError',
    PARAMES_ERROR: 'paramesError',
    TIME_OUT: 'timeoutError',
    SCRIPT_WORK_ERROR: 'scriptWorkError'
}
export class CommonException implements Error {
    constructor(public name: string, public message: string, public code: ErrorCode) { }
}
