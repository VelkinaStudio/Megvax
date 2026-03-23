import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { MetaApiClient } from './meta-api.client';
import { EncryptionService } from './encryption.service';
import { MetaSyncProcessor } from './meta-sync.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'meta-sync' }),
    BullModule.registerQueue({ name: 'autopilot' }),
  ],
  controllers: [MetaController],
  providers: [MetaService, MetaApiClient, EncryptionService, MetaSyncProcessor],
  exports: [MetaService, MetaApiClient, EncryptionService],
})
export class MetaModule {}
