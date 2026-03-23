import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { MetaApiClient } from './meta-api.client';
import { EncryptionService } from './encryption.service';

@Module({
  controllers: [MetaController],
  providers: [MetaService, MetaApiClient, EncryptionService],
  exports: [MetaService, MetaApiClient, EncryptionService],
})
export class MetaModule {}
