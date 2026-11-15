import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterMemberDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1 555-0199' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '742 Evergreen Terrace' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'plan-uuid' })
  @IsOptional()
  planId?: string;
}
