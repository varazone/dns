import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramResponse } from './types/program.response';
import { GetProgramsResponse } from './types/programs.response';
import { ProgramAllRequest } from './types/program-all.request';
import { ProgramEntity } from '../entities/program.entity';
import { DnsEntity } from '../entities/dns.entity';

@Injectable()
export class DnsService {
  constructor(@InjectRepository(ProgramEntity) private readonly repo: Repository<ProgramEntity>,
              @InjectRepository(DnsEntity) private readonly dnsRepo: Repository<DnsEntity>) {
  }

  async getDns(): Promise<DnsEntity> {
    return this.dnsRepo.find({where: {}}).then(res => res[0]);
  }

  async getPrograms(request: ProgramAllRequest): Promise<GetProgramsResponse> {
    const builder = this.repo.createQueryBuilder('o');
    builder.where('1=1')
    if (request.search) {
      builder.andWhere('(o.name ILIKE :search or o.address ILIKE :search)', {search: `%${request.search}%`});
    }
    if (request.createdBy) {
      builder.andWhere('o.createdBy = :createdBy', {createdBy: request.createdBy});
    }
    const limit = request.limit || 10;
    const offset = request.offset || 0;
    builder.limit(limit);
    builder.offset(offset);
    if (request.orderByField && request.orderByDirection) {
      builder.addOrderBy(`o.${request.orderByField}`, request.orderByDirection);
    }
    const [programs, count] = await builder.getManyAndCount();
    return {
      data: programs.map(this.toDto),
      count,
    };
  }

  async getProgramByName(name: string): Promise<ProgramResponse | null> {
    const program = await this.repo.findOneBy({name});
    return this.toDto(program);
  }

  async getProgramByAddress(address: string): Promise<ProgramResponse | null> {
    const program = await this.repo.findOneBy({address});
    return this.toDto(program);
  }

  toDto(program: ProgramEntity | null): ProgramResponse | null {
    if (!program) {
      return null;
    }
    return {
      id: program.id,
      name: program.name,
      admin: program.admin,
      createdBy: program.createdBy,
      address: program.address,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    };
  }
}
