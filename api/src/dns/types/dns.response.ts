import { ApiProperty } from '@nestjs/swagger';

export class DnsResponse {
  @ApiProperty()
  contract: string;
}
