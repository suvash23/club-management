import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { EventStatus, RegistrationStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: EventStatus) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.clubEvent.findMany({
      where,
      orderBy: { startDateTime: 'asc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.clubEvent.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            member: {
              include: { user: { select: { email: true } } },
            },
          },
          orderBy: { registeredAt: 'asc' },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(dto: CreateEventDto) {
    return this.prisma.clubEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startDateTime: new Date(dto.startDateTime),
        endDateTime: dto.endDateTime ? new Date(dto.endDateTime) : null,
        maxAttendees: dto.maxAttendees ? Number(dto.maxAttendees) : 50,
        fee: dto.fee ? Number(dto.fee) : 0,
        status: dto.status || EventStatus.UPCOMING,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    return this.prisma.clubEvent.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startDateTime: new Date(dto.startDateTime),
        endDateTime: dto.endDateTime ? new Date(dto.endDateTime) : null,
        maxAttendees: dto.maxAttendees ? Number(dto.maxAttendees) : undefined,
        fee: dto.fee !== undefined ? Number(dto.fee) : undefined,
        status: dto.status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.clubEvent.delete({
      where: { id },
    });
  }

  async registerMember(eventId: string, userId: string) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const event = await this.findOne(eventId);
    const existing = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId: member.id,
        },
      },
    });

    if (existing) {
      if (existing.status === RegistrationStatus.CANCELLED) {
        return this.prisma.eventRegistration.update({
          where: { id: existing.id },
          data: { status: RegistrationStatus.REGISTERED, registeredAt: new Date() },
        });
      }
      throw new BadRequestException('You are already registered for this event');
    }

    const count = await this.prisma.eventRegistration.count({
      where: { eventId, status: RegistrationStatus.REGISTERED },
    });
    if (count >= event.maxAttendees) {
      throw new BadRequestException('This event has reached its maximum attendee capacity');
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        memberId: member.id,
        status: RegistrationStatus.REGISTERED,
      },
      include: {
        event: true,
      },
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    const member = await this.prisma.memberProfile.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const registration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId: member.id,
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration record not found');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { status: RegistrationStatus.CANCELLED },
    });
  }

  async updateAttendance(registrationId: string, status: RegistrationStatus) {
    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status },
    });
  }
}
