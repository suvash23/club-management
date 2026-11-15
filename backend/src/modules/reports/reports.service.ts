import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, MemberStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getFinancialReport() {
    const payments = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.PAID },
      orderBy: { paidAt: 'asc' },
    });

    // Group by month
    const monthlyRevenue: Record<string, number> = {};
    const methodBreakdown: Record<string, number> = {};

    payments.forEach((p) => {
      const monthKey = new Date(p.paidAt).toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + p.amount;
      methodBreakdown[p.method] = (methodBreakdown[p.method] || 0) + p.amount;
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      totalTransactions: payments.length,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
      methodBreakdown: Object.entries(methodBreakdown).map(([method, amount]) => ({ method, amount })),
    };
  }

  async getMembershipGrowth() {
    const members = await this.prisma.memberProfile.findMany({
      orderBy: { joinDate: 'asc' },
      select: { joinDate: true, status: true },
    });

    const statusCounts: Record<string, number> = {
      ACTIVE: 0,
      INACTIVE: 0,
      EXPIRED: 0,
    };

    const monthlyGrowth: Record<string, number> = {};

    members.forEach((m) => {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
      const monthKey = new Date(m.joinDate).toISOString().substring(0, 7);
      monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1;
    });

    return {
      statusCounts,
      totalMembers: members.length,
      monthlyGrowth: Object.entries(monthlyGrowth).map(([month, count]) => ({ month, count })),
    };
  }

  async exportMembersCsv() {
    const members = await this.prisma.memberProfile.findMany({
      include: {
        user: { select: { email: true } },
        subscriptions: {
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const headers = ['Member ID', 'Name', 'Email', 'Phone', 'Status', 'Plan', 'Join Date'];
    const rows = members.map((m) => [
      m.memberCode,
      `"${m.firstName} ${m.lastName}"`,
      m.user?.email || '',
      m.phone || '',
      m.status,
      m.subscriptions[0]?.plan?.name || 'No Plan',
      new Date(m.joinDate).toLocaleDateString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  async exportPaymentsCsv() {
    const payments = await this.prisma.payment.findMany({
      include: {
        member: true,
      },
      orderBy: { paidAt: 'desc' },
    });

    const headers = ['Invoice Number', 'Member Code', 'Member Name', 'Amount', 'Method', 'Status', 'Date'];
    const rows = payments.map((p) => [
      p.invoiceNumber,
      p.member.memberCode,
      `"${p.member.firstName} ${p.member.lastName}"`,
      p.amount.toFixed(2),
      p.method,
      p.status,
      new Date(p.paidAt).toLocaleDateString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
