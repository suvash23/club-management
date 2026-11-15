import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    memberProfile: {
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    membershipPlan: {
      findUnique: jest.fn(),
    },
    memberSubscription: {
      create: jest.fn(),
    },
    payment: {
      count: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendMembershipRenewalEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    prisma = mockPrisma as any;
    jwtService = mockJwtService as any;
    mailService = mockMailService as any;

    service = new AuthService(prisma, jwtService, mailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully return token and user for valid credentials', async () => {
      const user = {
        id: 'user-1',
        email: 'admin@club.com',
        password: 'hashed-password',
        role: 'ADMIN',
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'admin@club.com', password: 'admin123' });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('admin@club.com');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@club.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is deactivated', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-2',
        email: 'inactive@club.com',
        isActive: false,
      });

      await expect(
        service.login({ email: 'inactive@club.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-3',
        email: 'member@club.com',
        password: 'hashed-password',
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'member@club.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should update password when current password matches', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-current',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new');
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1' });

      const result = await service.changePassword('user-1', 'current-pw', 'new-pw');
      expect(result.message).toBe('Password changed successfully.');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: 'hashed-new' },
      });
    });

    it('should throw BadRequestException if current password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-current',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', 'wrong-pw', 'new-pw'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
