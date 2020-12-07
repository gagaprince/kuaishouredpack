import { Controller, Get, Query, Header } from '@nestjs/common';
import { DeviceService, IDevice } from './device.service';
import { AdbService } from '../adb/adb.service';



@Controller('/kuaishou/device')
export class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
        private readonly adbService: AdbService
    ) { }

    @Get('/getDevices')
    // @Header('Cache-Control', 'none')
    // @Header('Content-Type', 'application/json;charset=utf-8')
    async getDevices() {
        return await this.deviceService.getDevicesInfo();
    }

    @Get('/reloadDevice')
    async reloadDevice(@Query() query: IDevice) {
        return await this.deviceService.reloadDevice(query);
    }

    @Get('/reloadApp')
    async reloadApp(@Query() query: IDevice){
        const device = this.deviceService.getDeviceByLion(query.phoneNumber);
        await this.adbService.restartAppByDevice(device);
        await this.deviceService.reloadDevice(device);
        return {code:0,success:true};
    }

    @Get('/stopApp')
    async stopApp(@Query() query: IDevice){
        const device = this.deviceService.getDeviceByLion(query.phoneNumber);
        await this.adbService.stopAppByDevice(device);
        return {code:0,success:true};
    }
}
