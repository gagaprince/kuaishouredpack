import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { CommonExceptionFilter } from './filters/commonException.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
// import { CatInterceptor } from './interceptors/cat.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { TraceInterceptor } from './interceptors/trace.interceptor';
import { QueryValidationPipe } from './pipes/Validation.pipe';
const mainDebug = require('debug')('main');
const config = require('config');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CommonExceptionFilter()); // 全局异常处理
  app.useGlobalInterceptors(new TraceInterceptor(), new TimeoutInterceptor(), new ResponseInterceptor()); // cat拦截器 response正常返回封装
  app.useGlobalPipes(new QueryValidationPipe()); // 参数校验的pipe
  await app.listen(config.port);
}
bootstrap();