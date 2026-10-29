import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export type SortOrder = 'ASC' | 'DESC';

/**
 * Base pagination query — extend per resource:
 *   class ProductQueryDto extends PaginationDto {
 *     @IsOptional() @IsString() category?: string;
 *   }
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'] as const)
  sortOrder?: SortOrder = 'DESC';

  /** Safe sort column whitelist — override in child DTO */
  allowedSortFields(): string[] {
    return ['createdAt'];
  }

  /** Clamp sortBy to an allowed column to prevent SQL injection via ORDER BY */
  safeSortBy(): string {
    return this.allowedSortFields().includes(this.sortBy ?? '')
      ? (this.sortBy as string)
      : 'createdAt';
  }

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function paginate<T>(data: T[], total: number, q: PaginationDto): Paginated<T> {
  return {
    data,
    meta: {
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit),
    },
  };
}
