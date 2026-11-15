import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'member@club.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'sample-token' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewSecret123!' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
