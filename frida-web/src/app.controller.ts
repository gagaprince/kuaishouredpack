import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
const config = require('config');



@Controller('/monitor')
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  @Get('/alive')
  async alive(): Promise<any> {
    return { alive: true };
  }
}
