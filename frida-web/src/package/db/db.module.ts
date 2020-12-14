import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { CountService } from './count.service';
import { DeviceModule } from '../device/device.module'

@Module({
  imports: [DeviceModule],
  providers: [DbService]
})
export class DbModule {
  constructor(private readonly dbService: DbService, private readonly countService: CountService) { }
}
