import { Module } from '@nestjs/common';
import { DnsModule } from './dns/dns.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity } from './entities/program.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [ProgramEntity],
      synchronize: false,
    }),
    DnsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
