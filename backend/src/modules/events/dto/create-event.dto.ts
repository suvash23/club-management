import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, Min, IsEnum, IsDateString } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ example: 'Annual Summer Gala 2026' })
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Join us for fine dining, awards, and networking.' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Grand Ballroom, Clubhouse' })
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '2026-12-05T18:00:00Z' })
  @IsDateString()
  startDateTime: string;

  @ApiPropertyOptional({ example: '2026-12-05T22:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttendees?: number;

  @ApiPropertyOptional({ example: 25.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;

  @ApiPropertyOptional({ enum: EventStatus, default: EventStatus.UPCOMING })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class UpdateEventDto extends CreateEventDto {}
