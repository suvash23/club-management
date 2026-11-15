import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';
import { MemberStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { search?: string; status?: MemberStatus; page?: number; limit?: number }) {
    const { search, status, page = 1, limit = 50 } = query || {};
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { memberCode: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, members] = await Promise.all([
      this.prisma.memberProfile.count({ where }),
      this.prisma.memberProfile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, isActive: true, role: true } },
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { payments: true, eventRegistrations: true },
          },
        },
      }),
    ]);

    return {
      data: members,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, isActive: true, role: true } },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
        eventRegistrations: {
          include: { event: true },
          orderBy: { registeredAt: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }
    return member;
  }

  async create(dto: CreateMemberDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('A member with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const memberCount = await this.prisma.memberProfile.count();
    const memberCode = `CLB-${String(1001 + memberCount).padStart(4, '0')}`;

    const member = await this.prisma.memberProfile.create({
      data: {
        memberCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        address: dto.address,
        avatarUrl: dto.avatarUrl,
        status: dto.status || MemberStatus.ACTIVE,
        user: {
          create: {
            email: dto.email.toLowerCase().trim(),
            password: hashedPassword,
            role: Role.MEMBER,
          },
        },
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    if (dto.planId) {
      const plan = await this.prisma.membershipPlan.findUnique({
        where: { id: dto.planId },
      });
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationInDays);

        const sub = await this.prisma.memberSubscription.create({
          data: {
            memberId: member.id,
            planId: plan.id,
            startDate,
            endDate,
            status: 'ACTIVE',
          },
        });

        const paymentCount = await this.prisma.payment.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(1001 + paymentCount).padStart(4, '0')}`;
        await this.prisma.payment.create({
          data: {
            invoiceNumber,
            memberId: member.id,
            subscriptionId: sub.id,
            amount: plan.price,
            method: 'CASH',
            status: 'PAID',
            notes: `Initial plan enrollment: ${plan.name}`,
          },
        });
      }
    }

    return this.findOne(member.id);
  }

  async update(id: string, dto: UpdateMemberDto) {
    await this.findOne(id);
    return this.prisma.memberProfile.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        address: dto.address,
        avatarUrl: dto.avatarUrl,
        status: dto.status,
      },
      include: {
        user: { select: { id: true, email: true } },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async updateStatus(id: string, status: MemberStatus) {
    await this.findOne(id);
    return this.prisma.memberProfile.update({
      where: { id },
      data: { status },
    });
  }

  async renewPlan(userId: string, planId: string, paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' = 'ONLINE') {
    const member = await this.prisma.memberProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });
    if (!plan || !plan.isActive) {
      throw new BadRequestException('Selected membership plan is invalid or inactive');
    }

    // Determine new start date: if currently active and future end date, extend from end date, else start today
    const currentActiveSub = await this.prisma.memberSubscription.findFirst({
      where: {
        memberId: member.id,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: 'desc' },
    });

    const startDate = currentActiveSub ? new Date(currentActiveSub.endDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationInDays);

    const subscription = await this.prisma.memberSubscription.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    });

    // Flip member status to ACTIVE
    await this.prisma.memberProfile.update({
      where: { id: member.id },
      data: { status: MemberStatus.ACTIVE },
    });

    const paymentCount = await this.prisma.payment.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(1001 + paymentCount).padStart(4, '0')}`;
    
    const payment = await this.prisma.payment.create({
      data: {
        invoiceNumber,
        memberId: member.id,
        subscriptionId: subscription.id,
        amount: plan.price,
        method: paymentMethod as any,
        status: 'PAID',
        notes: `Plan Renewal: ${plan.name}`,
      },
    });

    return {
      message: 'Plan renewed successfully',
      subscription,
      payment,
      endDate,
    };
  }

  async remove(id: string) {
    const member = await this.findOne(id);
    await this.prisma.user.delete({
      where: { id: member.userId },
    });
    return { success: true, message: 'Member and user account removed successfully' };
  }
}
