import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SPORTSPOT database seed...');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.sponsorshipAgreement.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedCampaign.deleteMany();
  await prisma.application.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.athleteProfile.deleteMany();
  await prisma.sponsorProfile.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Consistent secure hash for seed accounts: "SportSpot2026!"
  const passwordHash = await argon2.hash('SportSpot2026!', {
    type: argon2.argon2id,
  });

  // 1. Create Platform Administrator
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sportspot.io',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin account seeded: admin@sportspot.io');

  // 2. Create Sponsors
  const apexUser = await prisma.user.create({
    data: {
      email: 'partnerships@apexnutrition.com',
      passwordHash,
      role: 'SPONSOR',
      status: 'ACTIVE',
      sponsorProfile: {
        create: {
          companyName: 'Apex Performance Nutrition',
          logoUrl: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=400&q=80',
          description: 'Pioneers in science-backed sports nutrition, clean energy isolates, and endurance recovery supplements for elite competitors.',
          industryCategory: 'Sports Nutrition & Health',
          website: 'https://apexnutrition.demo',
          contactPerson: 'David K. Vance',
          businessLocation: 'Boulder, Colorado, USA',
          contactPhone: '+1 (555) 234-5678',
          isVerified: true,
        },
      },
    },
    include: { sponsorProfile: true },
  });

  const vortexUser = await prisma.user.create({
    data: {
      email: 'sponsorships@vortexgear.com',
      passwordHash,
      role: 'SPONSOR',
      status: 'ACTIVE',
      sponsorProfile: {
        create: {
          companyName: 'Vortex Athletics Apparel',
          logoUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=400&q=80',
          description: 'Engineered aerodynamic compression wear, carbon-plate track spikes, and performance equipment for championship athletics.',
          industryCategory: 'Apparel & Equipment',
          website: 'https://vortexgear.demo',
          contactPerson: 'Sarah Jenkins',
          businessLocation: 'Portland, Oregon, USA',
          contactPhone: '+1 (555) 876-5432',
          isVerified: true,
        },
      },
    },
    include: { sponsorProfile: true },
  });

  const zenithUser = await prisma.user.create({
    data: {
      email: 'athlete.grants@zenithcapital.com',
      passwordHash,
      role: 'SPONSOR',
      status: 'ACTIVE',
      sponsorProfile: {
        create: {
          companyName: 'Zenith FinTech & Global Grants',
          logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
          description: 'Institutional corporate endowment funding grassroots to world-stage athletes with financial literacy and travel sponsorships.',
          industryCategory: 'Financial Services & Grants',
          website: 'https://zenithgrants.demo',
          contactPerson: 'Alexander Thorne',
          businessLocation: 'New York, NY, USA',
          contactPhone: '+1 (555) 345-9876',
          isVerified: true,
        },
      },
    },
    include: { sponsorProfile: true },
  });

  console.log('✅ Sponsors seeded: Apex, Vortex, Zenith');

  // 3. Create Athletes
  const marcusUser = await prisma.user.create({
    data: {
      email: 'marcus.vance@athlete.sportspot.io',
      passwordHash,
      role: 'ATHLETE',
      status: 'ACTIVE',
      athleteProfile: {
        create: {
          fullName: 'Marcus Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
          bio: '100m & 200m track sprinter. 2025 National Collegiate Champion (PB: 9.98s). Focused on qualifying for World Athletics Championships 2027.',
          primarySport: 'Track & Field',
          secondarySports: 'Sprint, Bobsleigh, Strength Training',
          location: 'Austin, Texas, USA',
          experienceLevel: 'NATIONAL_LEVEL',
          isPublic: true,
          isVerified: true,
          socialLinks: JSON.stringify({
            instagram: 'https://instagram.com/marcus_sprints',
            twitter: 'https://twitter.com/marcusvance',
            youtube: 'https://youtube.com/@marcusvancetrack',
          }),
          achievements: {
            create: [
              {
                title: 'National Men’s 100m Championship',
                year: 2025,
                tournament: 'USA Track & Field National Series',
                rankOrMedal: 'Gold Medal (1st Place)',
                description: 'Set a new venue record with a wind-legal 9.98s in the finals.',
                isVerified: true,
              },
              {
                title: 'Pan American Games Bronze Medalist',
                year: 2024,
                tournament: 'Pan American Junior Championships',
                rankOrMedal: 'Bronze Medal (3rd Place)',
                description: 'Represented national youth delegation in 4x100m relay.',
                isVerified: true,
              },
            ],
          },
          certificates: {
            create: [
              {
                title: 'USATF Certified National Level Athlete',
                issuingOrg: 'USA Track & Field Federation',
                issueDate: new Date('2024-05-15'),
                fileUrl: '/uploads/certificates/usatf-cert-marcus.pdf',
                isVerified: true,
              },
            ],
          },
        },
      },
    },
    include: { athleteProfile: true },
  });

  const elenaUser = await prisma.user.create({
    data: {
      email: 'elena.rostova@athlete.sportspot.io',
      passwordHash,
      role: 'ATHLETE',
      status: 'ACTIVE',
      athleteProfile: {
        create: {
          fullName: 'Elena Rostova',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
          bio: 'International Artistic Gymnast. World Cup Balance Beam Silver Medalist. Training for 2028 Summer Olympic qualification.',
          primarySport: 'Gymnastics',
          secondarySports: 'Dance, Pilates, Acrobatics',
          location: 'San Jose, California, USA',
          experienceLevel: 'INTERNATIONAL_PRO',
          isPublic: true,
          isVerified: true,
          socialLinks: JSON.stringify({
            instagram: 'https://instagram.com/elena_gymnastics',
          }),
          achievements: {
            create: [
              {
                title: 'FIG Artistic Gymnastics World Cup',
                year: 2025,
                tournament: 'FIG World Challenge Cup Series',
                rankOrMedal: 'Silver Medal (Beam)',
                description: 'Scored 14.850 on balance beam routine with highest difficulty rating.',
                isVerified: true,
              },
            ],
          },
        },
      },
    },
    include: { athleteProfile: true },
  });

  const priyaUser = await prisma.user.create({
    data: {
      email: 'priya.sharma@athlete.sportspot.io',
      passwordHash,
      role: 'ATHLETE',
      status: 'ACTIVE',
      athleteProfile: {
        create: {
          fullName: 'Priya Sharma',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
          bio: 'Badminton singles player. State Champion and rising star on the National Ranking Circuit. Seeking equipment & travel sponsorship.',
          primarySport: 'Badminton',
          secondarySports: 'Tennis, Squash, Conditioning',
          location: 'Chicago, Illinois, USA',
          experienceLevel: 'STATE_LEVEL',
          isPublic: true,
          isVerified: true,
          socialLinks: JSON.stringify({
            instagram: 'https://instagram.com/priya_badminton',
          }),
        },
      },
    },
    include: { athleteProfile: true },
  });

  console.log('✅ Athletes seeded: Marcus, Elena, Priya');

  // 4. Create Sponsorship Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      sponsorId: apexUser.sponsorProfile!.id,
      title: 'Apex NextGen Elite Athlete Grant 2026',
      sportCategory: 'Track & Field',
      sponsorshipType: 'FINANCIAL',
      budgetMin: 15000,
      budgetMax: 35000,
      currency: 'USD',
      description: 'Apex Nutrition is selecting three national-caliber track & field athletes for our 2026 endowment program. Includes full coaching subsidies, medical screening, and complete nutritional supply.',
      eligibilityRequirements: 'Must compete at State or National Championship tier. Clean WADA record. Active competitive schedule in 2026.',
      location: 'Global',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in future
      status: 'APPROVED',
      viewsCount: 428,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      sponsorId: vortexUser.sponsorProfile!.id,
      title: 'Vortex Pro Team Apparel & Footwear Sponsorship',
      sportCategory: 'Track & Field',
      sponsorshipType: 'EQUIPMENT',
      budgetMin: 8000,
      budgetMax: 18000,
      currency: 'USD',
      description: 'Comprehensive gear contract covering competition track spikes, custom aerodynamic race suits, winter training apparel, and competition travel duffels.',
      eligibilityRequirements: 'Track & field sprint or distance competitors with verified regional tournament podium finishes.',
      location: 'North America',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'APPROVED',
      viewsCount: 312,
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      sponsorId: zenithUser.sponsorProfile!.id,
      title: 'Zenith Olympic Trajectory Grant for Gymnasts & Aquatic Athletes',
      sportCategory: 'Gymnastics',
      sponsorshipType: 'TRAINING',
      budgetMin: 25000,
      budgetMax: 50000,
      currency: 'USD',
      description: 'Comprehensive grant backing world-stage gymnasts aiming for the 2028 Olympic cycle. Direct payment toward international travel, physiotherapists, and elite training camps.',
      eligibilityRequirements: 'International or National Level ranking in FIG or World Aquatics accredited events.',
      location: 'Global',
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'APPROVED',
      viewsCount: 560,
    },
  });

  // Pending campaign for Admin Moderation demo
  const pendingCampaign = await prisma.campaign.create({
    data: {
      sponsorId: vortexUser.sponsorProfile!.id,
      title: 'Vortex Rising Stars Badminton & Racket Sports Program',
      sportCategory: 'Badminton',
      sponsorshipType: 'INDIVIDUAL',
      budgetMin: 5000,
      budgetMax: 12000,
      currency: 'USD',
      description: 'Aimed at emerging junior and collegiate badminton players needing carbon racket sponsorships, strings, court footwear, and tournament entry stipends.',
      eligibilityRequirements: 'State level competitors with at least 2 tournament quarterfinals in past 12 months.',
      location: 'Global',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'PENDING_APPROVAL',
      viewsCount: 18,
    },
  });

  console.log('✅ Campaigns seeded (3 Approved, 1 Pending Moderation)');

  // 5. Create Applications
  const app1 = await prisma.application.create({
    data: {
      campaignId: campaign1.id,
      athleteId: marcusUser.athleteProfile!.id,
      pitch: 'As the 2025 National 100m Champion (9.98s), my training block requires precision nutrition and recovery. Partnering with Apex will empower my World Championship buildup while giving Apex high-visibility podium representation.',
      requestedAmount: 28000,
      status: 'SHORTLISTED',
      matchScore: 95,
      matchReason: 'Direct sport match: Track & Field and Meets high-level national competition tier requirements.',
      sponsorNote: 'Exceptional sprint metrics. Reviewing contract draft terms.',
    },
  });

  const app2 = await prisma.application.create({
    data: {
      campaignId: campaign3.id,
      athleteId: elenaUser.athleteProfile!.id,
      pitch: 'Currently ranked in top 3 balance beam routines internationally. I am preparing for the Pan American Games and World Cup series, which requires intensive international transit and physiotherapy.',
      requestedAmount: 40000,
      status: 'ACCEPTED',
      matchScore: 98,
      matchReason: 'Direct sport match: Gymnastics and Meets high-level national competition tier requirements.',
      sponsorNote: 'Olympic caliber profile. Approved for contract drafting.',
    },
  });

  console.log('✅ Applications seeded (1 Shortlisted, 1 Accepted)');

  // 6. Create Formal Sponsorship Agreement for accepted application
  await prisma.sponsorshipAgreement.create({
    data: {
      campaignId: campaign3.id,
      applicationId: app2.id,
      athleteId: elenaUser.athleteProfile!.id,
      sponsorId: zenithUser.sponsorProfile!.id,
      amount: 40000,
      currency: 'USD',
      durationMonths: 12,
      terms: 'Sponsor agrees to disburse $40,000 in quarterly tranches ($10,000 each) designated for elite training camps, international flight logistics, and sports medicine. Athlete agrees to brand logo display on competition warmups, 4 social media highlights per quarter, and appearance at annual youth sports summit.',
      status: 'SIGNED',
      pdfPath: '/uploads/agreements/agreement-zenith-elena-2026.pdf',
    },
  });

  // 7. Seed Direct Conversation & Messages
  const conversation = await prisma.conversation.create({
    data: {
      athleteId: marcusUser.athleteProfile!.id,
      sponsorId: apexUser.sponsorProfile!.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: apexUser.id,
        content: 'Hi Marcus, huge congratulations on the 9.98s victory at Nationals! We were thoroughly impressed by your race splits.',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation.id,
        senderId: marcusUser.id,
        content: 'Thank you David! Really appreciate you reaching out. I’ve been using Apex electrolytes throughout my prep blocks.',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conversation.id,
        senderId: apexUser.id,
        content: 'We are shortlisting your application for the $28,000 grant. Would love to schedule a briefing call later this week.',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 8. Seed Upcoming Events
  await prisma.event.createMany({
    data: [
      {
        title: 'World Athletics Continental Tour 2026',
        sport: 'Track & Field',
        organizer: 'World Athletics & USATF',
        location: 'Icahn Stadium, New York, NY',
        eventDate: new Date('2026-06-14T09:00:00Z'),
        description: 'Premier Gold level international track meet featuring Olympic medalists and world record holders.',
        sponsorshipOpen: true,
        registrationLink: 'https://worldathletics.org',
      },
      {
        title: 'International Racket Masters Open',
        sport: 'Badminton',
        organizer: 'National Badminton Association',
        location: 'United Center, Chicago, IL',
        eventDate: new Date('2026-07-22T10:00:00Z'),
        description: 'Elite national badminton championship with over 250 registered international competitors.',
        sponsorshipOpen: true,
        registrationLink: 'https://badmintonopen.demo',
      },
      {
        title: 'Pacific Rim Artistic Gymnastics Invitational',
        sport: 'Gymnastics',
        organizer: 'Pacific Rim Gymnastics Alliance',
        location: 'SAP Center, San Jose, CA',
        eventDate: new Date('2026-08-05T14:00:00Z'),
        description: 'Championship showcase featuring Olympic hopefuls on vault, floor exercise, and balance beam.',
        sponsorshipOpen: true,
        registrationLink: 'https://pacificrimgym.demo',
      },
    ],
  });

  // 9. Seed In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: marcusUser.id,
        title: 'Application Shortlisted!',
        message: 'Apex Performance Nutrition has shortlisted your application for the Apex NextGen Elite Grant.',
        type: 'APPLICATION_STATUS',
        isRead: false,
        actionUrl: `/dashboard/athlete/applications`,
      },
      {
        userId: elenaUser.id,
        title: 'Sponsorship Agreement Executed',
        message: 'Zenith FinTech & Global Grants has finalized your $40,000 annual sponsorship agreement.',
        type: 'AGREEMENT_UPDATE',
        isRead: true,
        actionUrl: `/dashboard/athlete/agreements`,
      },
      {
        userId: adminUser.id,
        title: 'New Campaign Pending Approval',
        message: 'Vortex Athletics Apparel submitted "Vortex Rising Stars Badminton Program" for review.',
        type: 'CAMPAIGN_APPROVAL',
        isRead: false,
        actionUrl: `/dashboard/admin/campaigns`,
      },
    ],
  });

  console.log('✅ Seed complete! All demo data loaded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
