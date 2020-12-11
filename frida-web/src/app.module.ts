import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeviceModule } from './package/device/device.module';
import { AdbModule } from './package/adb/adb.module';
import { DbModule } from './package/db/db.module';


@Module({
  imports: [DeviceModule, AdbModule, DbModule],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
