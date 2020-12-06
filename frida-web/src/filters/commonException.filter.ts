import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { CommonException } from '../package/common/exception/CommonException';
import { AdbService } from 'src/package/adb/adb.service';
const catDebug = require('debug')('commonException:');

@Catch(CommonException)
export class CommonExceptionFilter implements ExceptionFilter {
  // constructor(app) {

  // }
  catch(exception: CommonException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    // const cat = request.cat;

    const { code, message, name } = exception;
    // cat.logError(name, message);
    const errorResponse = {
      data: null,
      message: message,
      code
    };
    try {
      response.status(200);
      response.header('Content-Type', 'application/json; charset=utf-8');
      response.send(errorResponse);
    } catch (e) {

    }
  }
}
