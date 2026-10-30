import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class ProductDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() category: string;
  @Type(() => Number) @IsNumber() @Min(0) price: number;
  @Type(() => Number) @IsNumber() @Min(0) stock: number;
  @IsOptional() @IsString() imageUrl?: string;
}
