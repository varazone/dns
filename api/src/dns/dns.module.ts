import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsController } from './dns.controller';
import { DnsService } from './dns.service';
import { ProgramEntity } from '../entities/program.entity';
import { DnsEntity } from '../entities/dns.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramEntity, DnsEntity])],
  controllers: [DnsController],
  providers: [DnsService],
})
export class DnsModule {}
