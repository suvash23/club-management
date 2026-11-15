import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Gold VIP Plan' })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Full access to gym, swimming pool, and premium club lounge' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 120.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 90, description: 'Duration in days' })
  @IsNumber()
  @Min(1)
  durationInDays: number;

  @ApiPropertyOptional({ example: 'Gym access, Sauna, 2 Guest passes per month' })
  @IsOptional()
  features?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePlanDto extends CreatePlanDto {}
