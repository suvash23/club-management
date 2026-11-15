import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordPaymentDto } from './dto/create-payment.dto';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { memberId?: string; status?: PaymentStatus; method?: PaymentMethod; page?: number; limit?: number }) {
    const { memberId, status, method, page = 1, limit = 10 } = query || {};
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (memberId) where.memberId = memberId;
    if (status) where.status = status;
    if (method) where.method = method;

    const [total, data] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { paidAt: 'desc' },
        include: {
          member: {
            select: {
              id: true,
              memberCode: true,
              firstName: true,
              lastName: true,
              user: { select: { email: true } },
            },
          },
          subscription: {
            include: { plan: true },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            user: { select: { email: true } },
          },
        },
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }
    return payment;
  }

  async recordPayment(dto: RecordPaymentDto) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { id: dto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const count = await this.prisma.payment.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(1001 + count).padStart(4, '0')}`;

    return this.prisma.payment.create({
      data: {
        invoiceNumber,
        memberId: dto.memberId,
        subscriptionId: dto.subscriptionId,
        amount: Number(dto.amount),
        method: dto.method || PaymentMethod.CASH,
        status: dto.status || PaymentStatus.PAID,
        notes: dto.notes,
      },
      include: {
        member: true,
        subscription: { include: { plan: true } },
      },
    });
  }

  async getMemberPayments(userId: string) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    return this.prisma.payment.findMany({
      where: { memberId: member.id },
      orderBy: { paidAt: 'desc' },
      include: {
        subscription: { include: { plan: true } },
      },
    });
  }
}
