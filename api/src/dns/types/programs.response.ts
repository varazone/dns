import { ApiProperty } from "@nestjs/swagger";
import { ProgramResponse } from './program.response';

export class GetProgramsResponse {
  @ApiProperty({ type: [ProgramResponse] })
  data: ProgramResponse[];

  @ApiProperty()
  count: number;
}
