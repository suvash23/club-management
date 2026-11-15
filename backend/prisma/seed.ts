import { PrismaClient, Role, MemberStatus, PaymentMethod, PaymentStatus, EventStatus, RegistrationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old database records...');
  await prisma.eventRegistration.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.memberSubscription.deleteMany();
  await prisma.clubEvent.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Membership Plans...');
  const planStandard = await prisma.membershipPlan.create({
    data: {
      name: 'Standard Monthly',
      description: 'Standard access to club facilities, lounge, and gym.',
      price: 49.0,
      durationInDays: 30,
      features: 'Full gym access, Club lounge access, 1 Guest pass per month',
      isActive: true,
    },
  });

  const planQuarterly = await prisma.membershipPlan.create({
    data: {
      name: 'Quarterly Executive',
      description: 'Great value for regular club members with extra guest privileges.',
      price: 129.0,
      durationInDays: 90,
      features: 'Gym & Spa, Club lounge, 3 Guest passes per month, 10% Restaurant discount',
      isActive: true,
    },
  });

  const planVIP = await prisma.membershipPlan.create({
    data: {
      name: 'VIP Platinum Annual',
      description: 'All-inclusive access to all premium club amenities, tennis court, pool, and VIP lounge.',
      price: 449.0,
      durationInDays: 365,
      features: 'Unlimited guest access, Dedicated locker, Free parking, Tennis & Pool reservation, 20% Dining discount',
      isActive: true,
    },
  });

  const planStudent = await prisma.membershipPlan.create({
    data: {
      name: 'Student & Youth Pass',
      description: 'Affordable tier for students and young athletes under 25.',
      price: 29.0,
      durationInDays: 30,
      features: 'Gym access during off-peak hours (8am - 4pm), Student community events',
      isActive: true,
    },
  });

  console.log('Seeding Users and Members...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  // 1. Admin
  await prisma.user.create({
    data: {
      email: 'admin@club.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // 2. Sample Demo Member
  const demoMemberUser = await prisma.user.create({
    data: {
      email: 'member@club.com',
      password: memberPassword,
      role: Role.MEMBER,
      memberProfile: {
        create: {
          memberCode: 'CLB-1001',
          firstName: 'Alex',
          lastName: 'Morgan',
          phone: '+1 555-0101',
          address: '42 Orchid Way, Suite 300',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          status: MemberStatus.ACTIVE,
          joinDate: new Date('2026-01-15'),
        },
      },
    },
    include: { memberProfile: true },
  });

  // Demo Member Subscription & Payment
  const alexSub = await prisma.memberSubscription.create({
    data: {
      memberId: demoMemberUser.memberProfile.id,
      planId: planVIP.id,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2027-01-15'),
      status: 'ACTIVE',
    },
  });

  await prisma.payment.create({
    data: {
      invoiceNumber: 'INV-202601-1001',
      memberId: demoMemberUser.memberProfile.id,
      subscriptionId: alexSub.id,
      amount: planVIP.price,
      method: PaymentMethod.ONLINE,
      status: PaymentStatus.PAID,
      notes: 'Annual Platinum VIP Renewal',
      paidAt: new Date('2026-01-15'),
    },
  });

  // 3. More Members
  const additionalMembers = [
    {
      email: 'sophia.chen@example.com',
      firstName: 'Sophia',
      lastName: 'Chen',
      phone: '+1 555-0102',
      address: '782 Willow Creek',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      status: MemberStatus.ACTIVE,
      plan: planQuarterly,
      joinDate: new Date('2026-03-10'),
      paymentMethod: PaymentMethod.CARD,
    },
    {
      email: 'david.miller@example.com',
      firstName: 'David',
      lastName: 'Miller',
      phone: '+1 555-0103',
      address: '124 Maple Drive',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      status: MemberStatus.ACTIVE,
      plan: planStandard,
      joinDate: new Date('2026-08-20'),
      paymentMethod: PaymentMethod.ONLINE,
    },
    {
      email: 'emily.watson@example.com',
      firstName: 'Emily',
      lastName: 'Watson',
      phone: '+1 555-0104',
      address: '900 Ocean Drive',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      status: MemberStatus.EXPIRED,
      plan: planStandard,
      joinDate: new Date('2025-10-01'),
      paymentMethod: PaymentMethod.CASH,
    },
    {
      email: 'marcus.vance@example.com',
      firstName: 'Marcus',
      lastName: 'Vance',
      phone: '+1 555-0105',
      address: '512 Pinecrest Ave',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      status: MemberStatus.ACTIVE,
      plan: planVIP,
      joinDate: new Date('2026-02-01'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
    },
    {
      email: 'clara.oswald@example.com',
      firstName: 'Clara',
      lastName: 'Oswald',
      phone: '+1 555-0106',
      address: '33 Tardis Lane',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80',
      status: MemberStatus.INACTIVE,
      plan: planStudent,
      joinDate: new Date('2026-06-15'),
      paymentMethod: PaymentMethod.CASH,
    },
  ];

  let memberCodeSeq = 1002;
  const createdProfiles = [demoMemberUser.memberProfile];

  for (const m of additionalMembers) {
    const user = await prisma.user.create({
      data: {
        email: m.email,
        password: memberPassword,
        role: Role.MEMBER,
        memberProfile: {
          create: {
            memberCode: `CLB-${memberCodeSeq++}`,
            firstName: m.firstName,
            lastName: m.lastName,
            phone: m.phone,
            address: m.address,
            avatarUrl: m.avatarUrl,
            status: m.status,
            joinDate: m.joinDate,
          },
        },
      },
      include: { memberProfile: true },
    });

    createdProfiles.push(user.memberProfile);

    // Subscription
    const endDate = new Date(m.joinDate);
    endDate.setDate(endDate.getDate() + m.plan.durationInDays);
    const subStatus = m.status === MemberStatus.EXPIRED ? 'EXPIRED' : 'ACTIVE';

    const sub = await prisma.memberSubscription.create({
      data: {
        memberId: user.memberProfile.id,
        planId: m.plan.id,
        startDate: m.joinDate,
        endDate,
        status: subStatus,
      },
    });

    // Payment
    await prisma.payment.create({
      data: {
        invoiceNumber: `INV-${m.joinDate.getFullYear()}${String(m.joinDate.getMonth() + 1).padStart(2, '0')}-${memberCodeSeq}`,
        memberId: user.memberProfile.id,
        subscriptionId: sub.id,
        amount: m.plan.price,
        method: m.paymentMethod,
        status: PaymentStatus.PAID,
        notes: `Subscription for ${m.plan.name}`,
        paidAt: m.joinDate,
      },
    });
  }

  console.log('Seeding Club Events...');
  const event1 = await prisma.clubEvent.create({
    data: {
      title: 'Annual Winter Charity Gala',
      description: 'An elegant black-tie evening featuring keynote speakers, live acoustic orchestra, and gourmet dinner.',
      location: 'Grand Ballroom, Clubhouse',
      startDateTime: new Date('2026-12-12T19:00:00Z'),
      endDateTime: new Date('2026-12-12T23:30:00Z'),
      maxAttendees: 120,
      fee: 45.0,
      status: EventStatus.UPCOMING,
    },
  });

  const event2 = await prisma.clubEvent.create({
    data: {
      title: 'Club Championship Tennis Tournament',
      description: 'Men and women singles and doubles tournament with awards and sponsor prizes.',
      location: 'Outdoor Courts 1-4',
      startDateTime: new Date('2026-11-28T09:00:00Z'),
      endDateTime: new Date('2026-11-28T17:00:00Z'),
      maxAttendees: 32,
      fee: 20.0,
      status: EventStatus.UPCOMING,
    },
  });

  const event3 = await prisma.clubEvent.create({
    data: {
      title: 'Private Wine & Artisanal Cheese Tasting',
      description: 'Sommelier-guided tasting of premium regional wines paired with handcrafted cheeses.',
      location: 'Clubhouse Cellar & Terrace',
      startDateTime: new Date('2026-12-02T18:30:00Z'),
      endDateTime: new Date('2026-12-02T21:00:00Z'),
      maxAttendees: 40,
      fee: 35.0,
      status: EventStatus.UPCOMING,
    },
  });

  const event4 = await prisma.clubEvent.create({
    data: {
      title: 'Wellness & Core Strength Workshop',
      description: 'A 2-hour masterclass with our head fitness instructor covering mobility, strength, and recovery.',
      location: 'Fitness Studio A',
      startDateTime: new Date('2026-11-22T10:00:00Z'),
      endDateTime: new Date('2026-11-22T12:00:00Z'),
      maxAttendees: 25,
      fee: 0.0,
      status: EventStatus.UPCOMING,
    },
  });

  console.log('Seeding Event Registrations...');
  // Alex registers for Gala and Tennis
  await prisma.eventRegistration.create({
    data: {
      eventId: event1.id,
      memberId: demoMemberUser.memberProfile.id,
      status: RegistrationStatus.REGISTERED,
    },
  });
  await prisma.eventRegistration.create({
    data: {
      eventId: event2.id,
      memberId: demoMemberUser.memberProfile.id,
      status: RegistrationStatus.REGISTERED,
    },
  });

  // Other members registered
  if (createdProfiles[1]) {
    await prisma.eventRegistration.create({
      data: {
        eventId: event1.id,
        memberId: createdProfiles[1].id,
        status: RegistrationStatus.REGISTERED,
      },
    });
  }
  if (createdProfiles[2]) {
    await prisma.eventRegistration.create({
      data: {
        eventId: event3.id,
        memberId: createdProfiles[2].id,
        status: RegistrationStatus.REGISTERED,
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin account: admin@club.com / admin123');
  console.log('Demo Member account: member@club.com / member123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
