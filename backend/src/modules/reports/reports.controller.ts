import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reports & Analytics')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial')
  @ApiOperation({ summary: 'Get financial revenue analysis (Admin only)' })
  getFinancial() {
    return this.reportsService.getFinancialReport();
  }

  @Get('membership')
  @ApiOperation({ summary: 'Get membership growth and status distribution (Admin only)' })
  getMembershipGrowth() {
    return this.reportsService.getMembershipGrowth();
  }

  @Get('export/members')
  @ApiOperation({ summary: 'Export all members as CSV (Admin only)' })
  async exportMembers(@Res() res: Response) {
    const csv = await this.reportsService.exportMembersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=members_export.csv');
    return res.send(csv);
  }

  @Get('export/payments')
  @ApiOperation({ summary: 'Export all payment transactions as CSV (Admin only)' })
  async exportPayments(@Res() res: Response) {
    const csv = await this.reportsService.exportPaymentsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments_export.csv');
    return res.send(csv);
  }
}
