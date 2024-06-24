import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DnsService } from './dns.service';
import { ProgramResponse } from './types/program.response';
import { DnsResponse } from './types/dns.response';
import { GetProgramsResponse } from './types/programs.response';
import { ProgramAllRequest } from './types/program-all.request';

@ApiTags('dns')
@Controller('dns')
export class DnsController {
  constructor(private readonly dnsService: DnsService) {
  }

  @Get('contract')
  @ApiOkResponse({type: DnsResponse})
  async getDns(): Promise<DnsResponse> {
    return this.dnsService.getDns().then(res => ({
      contract: res.address
    }));
  }

  @Get('')
  @ApiOkResponse({ type: GetProgramsResponse })
  async getAll(@Query() query: ProgramAllRequest): Promise<GetProgramsResponse> {
    return this.dnsService.getPrograms(query);
  }

  @Get('by_name/:name')
  @ApiOkResponse({type: ProgramResponse})
  async getProgramByName(@Param('name') name: string): Promise<ProgramResponse> {
    const program = await this.dnsService.getProgramByName(name);
    if (!program) {
      throw new NotFoundException(`Program with name ${name} not found`);
    }
    return program;
  }

  @Get('by_address/:address')
  @ApiOkResponse({type: ProgramResponse})
  async getProgramByAddress(@Param('address') address: string): Promise<ProgramResponse> {
    const program = await this.dnsService.getProgramByAddress(address);
    if (!program) {
      throw new NotFoundException(`Program with address ${address} not found`);
    }
    return program;
  }
}
