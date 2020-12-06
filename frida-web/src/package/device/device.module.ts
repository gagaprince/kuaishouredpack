import { Module } from '@nestjs/common';
import { AdbModule } from '../adb/adb.module';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { SourceScriptService } from './sourceScript.service';

@Module({
    imports: [AdbModule],
    controllers: [DeviceController],
    providers: [DeviceService, SourceScriptService],
    exports: [DeviceService]
})
export class DeviceModule {

}
