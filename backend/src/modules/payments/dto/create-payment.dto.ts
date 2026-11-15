import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class RecordPaymentDto {
  @ApiProperty({ example: 'member-profile-id' })
  @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional({ example: 'subscription-id' })
  @IsOptional()
  subscriptionId?: string;

  @ApiProperty({ example: 75.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.PAID })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'Renewal fee for 2026' })
  @IsOptional()
  notes?: string;
}
