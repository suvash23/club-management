import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Role, MemberStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterMemberDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        memberProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact administration.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    const { password, ...safeUser } = user;
    return {
      accessToken: token,
      user: safeUser,
    };
  }

  async registerMember(dto: RegisterMemberDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('A user with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const memberCount = await this.prisma.memberProfile.count();
    const memberCode = `CLB-${String(1001 + memberCount).padStart(4, '0')}`;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        role: Role.MEMBER,
        memberProfile: {
          create: {
            memberCode,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            address: dto.address,
            status: MemberStatus.ACTIVE,
          },
        },
      },
      include: {
        memberProfile: true,
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

        const subscription = await this.prisma.memberSubscription.create({
          data: {
            memberId: user.memberProfile.id,
            planId: plan.id,
            startDate,
            endDate,
            status: 'ACTIVE',
          },
        });

        // Record initial payment record
        const paymentCount = await this.prisma.payment.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(1001 + paymentCount).padStart(4, '0')}`;
        await this.prisma.payment.create({
          data: {
            invoiceNumber,
            memberId: user.memberProfile.id,
            subscriptionId: subscription.id,
            amount: plan.price,
            method: 'ONLINE',
            status: 'PAID',
            notes: `Enrollment in ${plan.name}`,
          },
        });
      }
    }

    const token = this.generateToken(user.id, user.email, user.role);
    const { password, ...safeUser } = user;
    return {
      accessToken: token,
      user: safeUser,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) {
      // Return success to avoid user enumeration
      return { message: 'If an account exists with that email, a password reset link has been dispatched.' };
    }

    const resetToken = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const resetTokenExpires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    });

    // Send actual password reset email
    const memberName = user.id
      ? (await this.prisma.memberProfile.findUnique({ where: { userId: user.id } }))?.firstName || 'Member'
      : 'Member';
    await this.mailService.sendPasswordResetEmail(user.email, memberName, resetToken);

    return {
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Password has been updated successfully. You can now login.' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberProfile: {
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
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully.' };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: process.env.JWT_SECRET || 'super-secret-club-jwt-token-2026-key',
        expiresIn: '7d',
      },
    );
  }
}
