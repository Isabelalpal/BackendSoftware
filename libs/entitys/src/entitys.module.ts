import { Module } from '@nestjs/common';
import { EntitysService } from './entitys.service';

@Module({
  providers: [EntitysService],
  exports: [EntitysService],
})
export class EntitysModule {}
