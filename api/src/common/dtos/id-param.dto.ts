import { IsUUID } from 'class-validator';

/** Route param DTO — validates :id path params as UUID v4 */
export class IdParamDto {
  @IsUUID('4', { message: 'id must be a valid UUID' })
  id: string;
}
