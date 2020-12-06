import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MyQuery = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const { method, query, body } = request;
        if (method === 'POST') {
            return body;
        } else {
            return query;
        }
    }
);