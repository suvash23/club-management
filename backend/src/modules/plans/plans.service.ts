import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(onlyActive = false) {
    return this.prisma.membershipPlan.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: { member: true },
          take: 10,
        },
      },
    });
    if (!plan) {
      throw new NotFoundException('Membership plan not found');
    }
    return plan;
  }

  async create(dto: CreatePlanDto) {
    return this.prisma.membershipPlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: Number(dto.price),
        durationInDays: Number(dto.durationInDays),
        features: dto.features,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.findOne(id);
    return this.prisma.membershipPlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: Number(dto.price),
        durationInDays: Number(dto.durationInDays),
        features: dto.features,
        isActive: dto.isActive,
      },
    });
  }

  async toggleActive(id: string) {
    const plan = await this.findOne(id);
    return this.prisma.membershipPlan.update({
      where: { id },
      data: {
        isActive: !plan.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.membershipPlan.delete({
      where: { id },
    });
  }
}
