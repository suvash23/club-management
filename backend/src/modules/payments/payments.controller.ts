import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { RecordPaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, PaymentMethod, PaymentStatus } from '@prisma/client';

@ApiTags('Payments & Invoicing')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all payments and filter (Admin only)' })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'method', enum: PaymentMethod, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('memberId') memberId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.findAll({ memberId, status, method, page, limit });
  }

  @Get('my-history')
  @Roles(Role.MEMBER, Role.ADMIN)
  @ApiOperation({ summary: 'Get current member payment history' })
  getMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.getMemberPayments(userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get payment / invoice receipt by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Record manual or offline payment (Admin only)' })
  recordPayment(@Body() dto: RecordPaymentDto) {
    return this.paymentsService.recordPayment(dto);
  }
}
