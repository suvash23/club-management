import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MemberStatus, PaymentStatus, EventStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const now = new Date();

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      inactiveMembers,
      totalPlans,
      paymentsAggregate,
      upcomingEvents,
      recentMembers,
      recentPayments,
    ] = await Promise.all([
      this.prisma.memberProfile.count(),
      this.prisma.memberProfile.count({ where: { status: MemberStatus.ACTIVE } }),
      this.prisma.memberProfile.count({ where: { status: MemberStatus.EXPIRED } }),
      this.prisma.memberProfile.count({ where: { status: MemberStatus.INACTIVE } }),
      this.prisma.membershipPlan.count({ where: { isActive: true } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.clubEvent.findMany({
        where: {
          startDateTime: { gte: now },
          status: EventStatus.UPCOMING,
        },
        include: {
          _count: { select: { registrations: true } },
        },
        orderBy: { startDateTime: 'asc' },
        take: 5,
      }),
      this.prisma.memberProfile.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.payment.findMany({
        take: 5,
        orderBy: { paidAt: 'desc' },
        include: {
          member: true,
        },
      }),
    ]);

    return {
      overview: {
        totalMembers,
        activeMembers,
        expiredMembers,
        inactiveMembers,
        totalPlans,
        totalPaymentsCount: paymentsAggregate._count.id || 0,
        totalPaymentsRevenue: paymentsAggregate._sum.amount || 0,
      },
      upcomingEvents,
      recentMembers,
      recentPayments,
    };
  }

  async getMemberStats(userId: string) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        payments: {
          orderBy: { paidAt: 'desc' },
          take: 5,
        },
        eventRegistrations: {
          include: {
            event: true,
          },
          orderBy: { registeredAt: 'desc' },
        },
      },
    });

    if (!member) {
      return null;
    }

    const currentSub = member.subscriptions[0];
    let daysRemaining = 0;
    if (currentSub && currentSub.status === 'ACTIVE') {
      const diff = new Date(currentSub.endDate).getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }

    const upcomingEvents = await this.prisma.clubEvent.findMany({
      where: {
        startDateTime: { gte: new Date() },
        status: EventStatus.UPCOMING,
      },
      include: {
        _count: { select: { registrations: true } },
      },
      orderBy: { startDateTime: 'asc' },
      take: 4,
    });

    return {
      member,
      currentSubscription: currentSub || null,
      daysRemaining,
      upcomingEvents,
      recentPayments: member.payments,
      enrolledEvents: member.eventRegistrations,
    };
  }
}
