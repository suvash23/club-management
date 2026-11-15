import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard metrics and overview' })
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('member')
  @Roles(Role.MEMBER, Role.ADMIN)
  @ApiOperation({ summary: 'Get logged-in member dashboard metrics' })
  getMemberStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getMemberStats(userId);
  }
}
