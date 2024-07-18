import { ApiPropertyOptional } from "@nestjs/swagger";

export enum OrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class ProgramAllRequest {
  @ApiPropertyOptional({
    description: 'Name or address'
  })
  search: string;

  @ApiPropertyOptional({
    description: 'Created by user address'
  })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'data size limits for result',
    default: 10,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'offset for result',
    default: 0,
  })
  offset?: number;

  @ApiPropertyOptional()
  orderByField: string;

  @ApiPropertyOptional({ enum: OrderByDirection })
  orderByDirection: OrderByDirection;
}
