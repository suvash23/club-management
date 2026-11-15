import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MemberStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptionsAndMembers() {
    this.logger.log('Running nightly subscription expiry check...');
    const now = new Date();

    // 1. Expire active subscriptions that have passed their end date
    const expiredSubs = await this.prisma.memberSubscription.updateMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lt: now },
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });

    this.logger.log(`Expired ${expiredSubs.count} subscription(s).`);

    // 2. Find members whose ALL subscriptions are expired/cancelled and mark them EXPIRED
    const membersWithExpiredSubs = await this.prisma.memberProfile.findMany({
      where: {
        status: MemberStatus.ACTIVE,
      },
      include: {
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
        },
      },
    });

    const toExpire = membersWithExpiredSubs.filter(
      (m) => m.subscriptions.length === 0,
    );

    if (toExpire.length > 0) {
      await this.prisma.memberProfile.updateMany({
        where: {
          id: { in: toExpire.map((m) => m.id) },
        },
        data: {
          status: MemberStatus.EXPIRED,
        },
      });
      this.logger.log(`Marked ${toExpire.length} member(s) as EXPIRED.`);
    }

    this.logger.log('Nightly expiry check complete.');
  }

  // Also run on startup immediately to sync any stale records
  async onModuleInit() {
    await this.expireSubscriptionsAndMembers();
  }
}
