import { PlansService } from './plans.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PlansService', () => {
  let service: PlansService;
  let prisma: PrismaService;

  const mockPrisma = {
    membershipPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    prisma = mockPrisma as any;
    service = new PlansService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of plans', async () => {
      const plans = [
        { id: '1', name: 'Standard', price: 49, durationInDays: 30, isActive: true },
        { id: '2', name: 'VIP', price: 449, durationInDays: 365, isActive: true },
      ];
      mockPrisma.membershipPlan.findMany.mockResolvedValue(plans);

      const result = await service.findAll();
      expect(result).toEqual(plans);
      expect(mockPrisma.membershipPlan.findMany).toHaveBeenCalledTimes(1);
    });

    it('should filter by active only when onlyActive is true', async () => {
      mockPrisma.membershipPlan.findMany.mockResolvedValue([]);
      await service.findAll(true);
      expect(mockPrisma.membershipPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a plan if found', async () => {
      const plan = { id: 'plan-1', name: 'Standard Monthly' };
      mockPrisma.membershipPlan.findUnique.mockResolvedValue(plan);

      const result = await service.findOne('plan-1');
      expect(result).toEqual(plan);
    });

    it('should throw NotFoundException if plan does not exist', async () => {
      mockPrisma.membershipPlan.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new membership plan', async () => {
      const dto = {
        name: 'Executive Plan',
        description: 'Premium access',
        price: 99.0,
        durationInDays: 60,
        features: 'Gym, Spa',
        isActive: true,
      };

      const createdPlan = { id: 'new-id', ...dto };
      mockPrisma.membershipPlan.create.mockResolvedValue(createdPlan);

      const result = await service.create(dto);
      expect(result).toEqual(createdPlan);
      expect(mockPrisma.membershipPlan.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          price: 99.0,
          durationInDays: 60,
          features: dto.features,
          isActive: true,
        },
      });
    });
  });

  describe('toggleActive', () => {
    it('should toggle plan isActive status', async () => {
      mockPrisma.membershipPlan.findUnique.mockResolvedValue({ id: 'plan-1', isActive: true });
      mockPrisma.membershipPlan.update.mockResolvedValue({ id: 'plan-1', isActive: false });

      const result = await service.toggleActive('plan-1');
      expect(result.isActive).toBe(false);
      expect(mockPrisma.membershipPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
        data: { isActive: false },
      });
    });
  });
});
