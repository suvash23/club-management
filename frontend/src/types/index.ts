export type Role = 'ADMIN' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type RegistrationStatus = 'REGISTERED' | 'ATTENDED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  memberProfile?: MemberProfile;
}

export interface MemberProfile {
  id: string;
  userId: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  status: MemberStatus;
  joinDate: string;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
    role: Role;
  };
  subscriptions?: MemberSubscription[];
  payments?: Payment[];
  eventRegistrations?: EventRegistration[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  features?: string;
  isActive: boolean;
  _count?: {
    subscriptions: number;
  };
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  planId: string;
  plan?: MembershipPlan;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

export interface Payment {
  id: string;
  invoiceNumber: string;
  memberId: string;
  member?: {
    id: string;
    memberCode: string;
    firstName: string;
    lastName: string;
    user?: { email: string };
  };
  subscriptionId?: string;
  subscription?: {
    plan?: { name: string };
  };
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  paidAt: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  description?: string;
  location: string;
  startDateTime: string;
  endDateTime?: string;
  maxAttendees: number;
  fee: number;
  status: EventStatus;
  _count?: {
    registrations: number;
  };
  registrations?: EventRegistration[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  event?: ClubEvent;
  memberId: string;
  member?: MemberProfile;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface AdminDashboardOverview {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  inactiveMembers: number;
  totalPlans: number;
  totalPaymentsCount: number;
  totalPaymentsRevenue: number;
}
