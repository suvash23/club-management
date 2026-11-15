import { EventsService } from './events.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventStatus, RegistrationStatus } from '@prisma/client';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    clubEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    memberProfile: {
      findUnique: jest.fn(),
    },
    eventRegistration: {
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    prisma = mockPrisma as any;
    service = new EventsService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return events ordered by startDateTime', async () => {
      const events = [
        { id: 'evt-1', title: 'Tennis Tournament', status: EventStatus.UPCOMING },
        { id: 'evt-2', title: 'Gala Dinner', status: EventStatus.UPCOMING },
      ];
      mockPrisma.clubEvent.findMany.mockResolvedValue(events);

      const result = await service.findAll();
      expect(result).toEqual(events);
      expect(mockPrisma.clubEvent.findMany).toHaveBeenCalled();
    });
  });

  describe('registerMember', () => {
    it('should register member for an event with available capacity', async () => {
      mockPrisma.memberProfile.findUnique.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.clubEvent.findUnique.mockResolvedValue({
        id: 'evt-1',
        title: 'Tennis Tournament',
        maxAttendees: 20,
      });
      mockPrisma.eventRegistration.findUnique.mockResolvedValue(null);
      mockPrisma.eventRegistration.count.mockResolvedValue(5);
      mockPrisma.eventRegistration.create.mockResolvedValue({
        id: 'reg-1',
        eventId: 'evt-1',
        memberId: 'mem-1',
        status: RegistrationStatus.REGISTERED,
      });

      const result = await service.registerMember('evt-1', 'user-1');
      expect(result.status).toBe(RegistrationStatus.REGISTERED);
      expect(mockPrisma.eventRegistration.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if event is fully booked', async () => {
      mockPrisma.memberProfile.findUnique.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.clubEvent.findUnique.mockResolvedValue({
        id: 'evt-1',
        maxAttendees: 10,
      });
      mockPrisma.eventRegistration.findUnique.mockResolvedValue(null);
      mockPrisma.eventRegistration.count.mockResolvedValue(10); // at capacity

      await expect(service.registerMember('evt-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if member is already registered', async () => {
      mockPrisma.memberProfile.findUnique.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.clubEvent.findUnique.mockResolvedValue({
        id: 'evt-1',
        maxAttendees: 50,
      });
      mockPrisma.eventRegistration.findUnique.mockResolvedValue({
        id: 'reg-existing',
        status: RegistrationStatus.REGISTERED,
      });

      await expect(service.registerMember('evt-1', 'user-1')).rejects.toThrow(
        'You are already registered for this event',
      );
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel active registration', async () => {
      mockPrisma.memberProfile.findUnique.mockResolvedValue({ id: 'mem-1' });
      mockPrisma.eventRegistration.findUnique.mockResolvedValue({ id: 'reg-1' });
      mockPrisma.eventRegistration.update.mockResolvedValue({
        id: 'reg-1',
        status: RegistrationStatus.CANCELLED,
      });

      const result = await service.cancelRegistration('evt-1', 'user-1');
      expect(result.status).toBe(RegistrationStatus.CANCELLED);
    });
  });
});
