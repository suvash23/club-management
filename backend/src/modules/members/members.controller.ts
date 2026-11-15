import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, MemberStatus } from '@prisma/client';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List and filter club members (Admin only)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: MemberStatus, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: MemberStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.membersService.findAll({ search, status, page, limit });
  }

  @Post('renew')
  @Roles(Role.MEMBER, Role.ADMIN)
  @ApiOperation({ summary: 'Self-renew membership plan for authenticated member' })
  renewPlan(
    @CurrentUser('id') userId: string,
    @Body('planId') planId: string,
    @Body('paymentMethod') paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE',
  ) {
    return this.membersService.renewPlan(userId, planId, paymentMethod);
  }

  @Post(':id/avatar')
  @Roles(Role.ADMIN, Role.MEMBER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload member avatar image' })
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const avatarUrl = `http://localhost:5000/uploads/avatars/${file.filename}`;
    return this.membersService.update(id, { avatarUrl });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get member full profile by ID' })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Register a new member (Admin only)' })
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Update member profile' })
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update member status (Admin only)' })
  updateStatus(@Param('id') id: string, @Body('status') status: MemberStatus) {
    return this.membersService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete member and associated user account (Admin only)' })
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}
