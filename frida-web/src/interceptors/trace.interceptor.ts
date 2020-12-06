
import {
    Injectable,
    NestInterceptor,
    CallHandler,
    ExecutionContext,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class TraceInterceptor<T>
    implements NestInterceptor<T, T> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>
    ): Observable<T> {
        const request = context.switchToHttp().getRequest();

        request.traceId = '';
        return next.handle().pipe(
            map((data: any) => {
                return data;
            }),
        );
    }
}
