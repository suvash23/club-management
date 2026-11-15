import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsEnum } from 'class-validator';
import { MemberStatus } from '@prisma/client';

export class CreateMemberDto {
  @ApiProperty({ example: 'sarah.connor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Sarah' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Connor' })
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1 555-0144' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '100 Sunset Boulevard' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' })
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'plan-uuid' })
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({ enum: MemberStatus, default: MemberStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ example: 'Sarah' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Connor' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1 555-0144' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '100 Sunset Boulevard' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' })
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: MemberStatus })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;
}
