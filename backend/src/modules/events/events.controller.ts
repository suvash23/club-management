import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, EventStatus, RegistrationStatus } from '@prisma/client';

@ApiTags('Events & Activities')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List all club events' })
  @ApiQuery({ name: 'status', enum: EventStatus, required: false })
  findAll(@Query('status') status?: EventStatus) {
    return this.eventsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get club event details and attendees' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (Admin only)' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register/RSVP for an event' })
  register(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.registerMember(id, userId);
  }

  @Post(':id/cancel-registration')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel RSVP for an event' })
  cancelRegistration(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.cancelRegistration(id, userId);
  }

  @Patch('registrations/:registrationId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark attendee status (Check-in/Attended) (Admin only)' })
  updateAttendance(
    @Param('registrationId') registrationId: string,
    @Body('status') status: RegistrationStatus,
  ) {
    return this.eventsService.updateAttendance(registrationId, status);
  }
}
