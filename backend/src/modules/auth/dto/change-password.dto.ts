import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword456!' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
