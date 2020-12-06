import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { CommonException, ErrorType, ErrorCode } from 'src/package/common/exception/CommonException';
const config = require('config');

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> {
        return next.handle().pipe(timeout(config.timeout), catchError((error: any) => {
            console.log(error);
            if (error.name === 'TimeoutError') {
                // throw new CommonException(ErrorType.TIME_OUT, '请求超时', ErrorCode.TIME_OUT);
                // 这里如果是发消息不能返回超时，需要返回正常的成功结果，不然后续任务会取消
                const host = context.switchToHttp();
                const request = host.getRequest();
                const { originalUrl, method, query, body } = request;
                let params = null;
                if (method === 'POST') {
                    params = body;
                } else {
                    params = query;
                }
                if (originalUrl.indexOf('/wework/msg') !== -1) {
                    //是发消息的接口  超时正常返回
                    const response = host.getResponse();
                    const ret = {
                        "data": {
                            "isSuccess": true
                        },
                        "code": 0,
                        "message": "请求成功"
                    };
                    response.status(200);
                    response.header('Content-Type', 'application/json; charset=utf-8');
                    response.send(ret);
                }
                throw new CommonException(ErrorType.TIME_OUT, '请求超时', ErrorCode.TIME_OUT);
            }
            throw error;
        }));
    }
}