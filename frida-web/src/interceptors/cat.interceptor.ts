import {
    Injectable,
    NestInterceptor,
    CallHandler,
    ExecutionContext,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class CatInterceptor<T>
    implements NestInterceptor<T, T> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>
    ): Observable<T> {

        const request = context.switchToHttp().getRequest();
        const query = request.query;
        const body = request.body;
        const cat = request.cat;
        const t = cat.newTransaction('URL', request.originalUrl);
        t.addData('query', query);
        t.addData('body', body);
        request.catT = t; // 将transaction 注入req

        return next.handle().pipe(
            map((data: any) => {
                if (data.code === 0) {
                    t.setStatus(cat.STATUS.SUCCESS);
                } else {
                    t.setStatus(cat.STATUS.FAIL); // 收集异常
                }
                t.addData('result', data);
                setTimeout(() => {
                    // 不影响业务数据返回
                    t.complete();
                });
                return data;
            }),
        );
    }
}
