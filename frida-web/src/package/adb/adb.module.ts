import { Module } from '@nestjs/common';
import { AdbService } from './adb.service';

@Module({
  providers: [AdbService],
  exports: [AdbService]
})
export class AdbModule {
  // constructor(private adbService: AdbService) {
  //   console.log('初始化！！！！！！！！！！！！！！！！！！！！');


  //   this.adbService.restartAppByDevice({ ip: '10.25.152.251', phoneNumber: '17601015566', adbPort: 5904 });

  // }
}
