import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up in dependency order
  await prisma.notification.deleteMany()
  await prisma.offerComment.deleteMany()
  await prisma.shipmentMilestone.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.offerItem.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // ─── Admin ───────────────────────────────────────────────────
  const adminCompany = await prisma.company.create({
    data: {
      name: 'Platform Admin',
      type: 'SUPPLIER',
      email: 'admin@platform.com',
      phone: '+994501234567',
      address: 'Baku, Azerbaijan',
      isVerified: true,
    },
  })
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      password: await bcrypt.hash('admin123', 12),
      name: 'Admin User',
      role: 'ADMIN',
      companyId: adminCompany.id,
    },
  })

  // ─── Supplier 1: Azerbaijan Import LLC ───────────────────────
  const supplier1 = await prisma.company.create({
    data: {
      name: 'Azerbaijan Import LLC',
      type: 'SUPPLIER',
      email: 'info@azimport.az',
      phone: '+994552345678',
      address: 'Nizami str. 45, Baku',
      isVerified: true,
    },
  })
  const supplierAdmin1 = await prisma.user.create({
    data: {
      email: 'supplier@azimport.az',
      password: await bcrypt.hash('supplier123', 12),
      name: 'Eldar Mammadov',
      role: 'SUPPLIER_EMPLOYEE',
      isCompanyAdmin: true,
      companyId: supplier1.id,
    },
  })
  const supplierEmp1 = await prisma.user.create({
    data: {
      email: 'emp1@azimport.az',
      password: await bcrypt.hash('emp123', 12),
      name: 'Aysel Hasanova',
      role: 'SUPPLIER_EMPLOYEE',
      isCompanyAdmin: false,
      companyId: supplier1.id,
    },
  })
  const supplierEmp2 = await prisma.user.create({
    data: {
      email: 'emp2@azimport.az',
      password: await bcrypt.hash('emp123', 12),
      name: 'Tural Aliyev',
      role: 'SUPPLIER_EMPLOYEE',
      isCompanyAdmin: false,
      companyId: supplier1.id,
    },
  })

  // ─── Supplier 2: Caspian Trade ────────────────────────────────
  const supplier2 = await prisma.company.create({
    data: {
      name: 'Caspian Trade Co.',
      type: 'SUPPLIER',
      email: 'info@caspiante.az',
      phone: '+994703456789',
      address: 'Fountains Square, Baku',
      isVerified: true,
    },
  })
  const supplierAdmin2 = await prisma.user.create({
    data: {
      email: 'supplier@caspiante.az',
      password: await bcrypt.hash('supplier123', 12),
      name: 'Nilufer Rzayeva',
      role: 'SUPPLIER_EMPLOYEE',
      isCompanyAdmin: true,
      companyId: supplier2.id,
    },
  })

  // ─── Logistics 1: Swift Cargo ─────────────────────────────────
  const logistics1 = await prisma.company.create({
    data: {
      name: 'Swift Cargo Azerbaijan',
      type: 'LOGISTICS',
      email: 'info@swiftcargo.az',
      phone: '+994604567890',
      address: 'Heydar Aliyev Ave 89, Baku',
      isVerified: true,
    },
  })
  const logisticsAdmin1 = await prisma.user.create({
    data: {
      email: 'logistics@swiftcargo.az',
      password: await bcrypt.hash('logistics123', 12),
      name: 'Kamran Huseynov',
      role: 'LOGISTICS_EMPLOYEE',
      isCompanyAdmin: true,
      companyId: logistics1.id,
    },
  })
  const logisticsEmp1 = await prisma.user.create({
    data: {
      email: 'emp1@swiftcargo.az',
      password: await bcrypt.hash('emp123', 12),
      name: 'Nigar Aliyeva',
      role: 'LOGISTICS_EMPLOYEE',
      isCompanyAdmin: false,
      companyId: logistics1.id,
    },
  })
  const logisticsEmp2 = await prisma.user.create({
    data: {
      email: 'emp2@swiftcargo.az',
      password: await bcrypt.hash('emp123', 12),
      name: 'Rashad Bagirov',
      role: 'LOGISTICS_EMPLOYEE',
      isCompanyAdmin: false,
      companyId: logistics1.id,
    },
  })

  // ─── Logistics 2: Baku Express ────────────────────────────────
  const logistics2 = await prisma.company.create({
    data: {
      name: 'Baku Express Freight',
      type: 'LOGISTICS',
      email: 'info@bakuexpress.az',
      phone: '+994515678901',
      address: 'Rashid Behbudov str. 12, Baku',
      isVerified: true,
    },
  })
  const logisticsAdmin2 = await prisma.user.create({
    data: {
      email: 'logistics@bakuexpress.az',
      password: await bcrypt.hash('logistics123', 12),
      name: 'Sevinj Quliyeva',
      role: 'LOGISTICS_EMPLOYEE',
      isCompanyAdmin: true,
      companyId: logistics2.id,
    },
  })
  const logisticsEmp3 = await prisma.user.create({
    data: {
      email: 'emp1@bakuexpress.az',
      password: await bcrypt.hash('emp123', 12),
      name: 'Fuad Isayev',
      role: 'LOGISTICS_EMPLOYEE',
      isCompanyAdmin: false,
      companyId: logistics2.id,
    },
  })

  // ─── Unverified ───────────────────────────────────────────────
  const unverifiedCompany = await prisma.company.create({
    data: {
      name: 'New Startup Logistics',
      type: 'LOGISTICS',
      email: 'info@newstartup.az',
      phone: '+994506789012',
      address: 'Landau str. 5, Baku',
      isVerified: false,
    },
  })
  await prisma.user.create({
    data: {
      email: 'test@newstartup.az',
      password: await bcrypt.hash('test123', 12),
      name: 'New Employee',
      role: 'LOGISTICS_EMPLOYEE',
      isCompanyAdmin: true,
      companyId: unverifiedCompany.id,
    },
  })

  // ─── Announcements ────────────────────────────────────────────
  const now = new Date()
  const d = (days: number) => new Date(now.getTime() + days * 86400000)
  const dAgo = (days: number) => new Date(now.getTime() - days * 86400000)

  const ann1 = await prisma.announcement.create({
    data: {
      title: 'Electronics Cargo to Germany',
      description: 'Sensitive electronic equipment requiring careful handling. Must be shipped in climate-controlled containers. Fragile items — professional packing required.',
      cargoType: 'Electronics',
      weight: 2500,
      volume: 15,
      origin: 'Baku, Azerbaijan',
      destination: 'Frankfurt, Germany',
      deadline: d(30),
      status: 'ACTIVE',
      supplierId: supplier1.id,
      createdById: supplierEmp1.id,
    },
  })

  const ann2 = await prisma.announcement.create({
    data: {
      title: 'Textile Products to Turkey',
      description: 'Large batch of textile products. Standard shipping acceptable. Flexible on transport mode.',
      cargoType: 'Textiles',
      weight: 8000,
      volume: 45,
      origin: 'Ganja, Azerbaijan',
      destination: 'Istanbul, Turkey',
      deadline: d(15),
      status: 'ACTIVE',
      supplierId: supplier1.id,
      createdById: supplierEmp2.id,
    },
  })

  const ann3 = await prisma.announcement.create({
    data: {
      title: 'Machinery Parts to Russia',
      description: 'Heavy industrial machinery parts. Special loading equipment required. BTK rail corridor preferred.',
      cargoType: 'Machinery',
      weight: 15000,
      volume: 80,
      origin: 'Baku, Azerbaijan',
      destination: 'Moscow, Russia',
      deadline: d(45),
      status: 'ACTIVE',
      supplierId: supplier2.id,
      createdById: supplierAdmin2.id,
    },
  })

  const ann4 = await prisma.announcement.create({
    data: {
      title: 'Food Products to UAE',
      description: 'Perishable food items requiring cold chain logistics. Temperature control mandatory.',
      cargoType: 'Food',
      weight: 5000,
      volume: 25,
      origin: 'Baku, Azerbaijan',
      destination: 'Dubai, UAE',
      deadline: d(-2),
      status: 'CLOSED',
      supplierId: supplier1.id,
      createdById: supplierEmp1.id,
    },
  })

  const ann5 = await prisma.announcement.create({
    data: {
      title: 'Chemical Materials to China',
      description: 'Non-hazardous chemical materials with standard documentation. MSDS sheets available.',
      cargoType: 'Chemicals',
      weight: 12000,
      volume: 60,
      origin: 'Sumgayit, Azerbaijan',
      destination: 'Shanghai, China',
      deadline: d(60),
      status: 'ACTIVE',
      supplierId: supplier2.id,
      createdById: supplierAdmin2.id,
    },
  })

  const ann6 = await prisma.announcement.create({
    data: {
      title: 'Agricultural Products to Georgia',
      description: 'Fresh agricultural produce — fruits and vegetables. Requires refrigerated transport.',
      cargoType: 'Agriculture',
      weight: 3000,
      volume: 18,
      origin: 'Lankaran, Azerbaijan',
      destination: 'Tbilisi, Georgia',
      deadline: d(7),
      status: 'ACTIVE',
      supplierId: supplier1.id,
      createdById: supplierAdmin1.id,
    },
  })

  // ─── Past announcements for historical reports ────────────────
  const pastAnns: any[] = []
  const routes = [
    { origin: 'Baku, Azerbaijan', destination: 'Frankfurt, Germany', cargoType: 'Electronics' },
    { origin: 'Ganja, Azerbaijan', destination: 'Istanbul, Turkey', cargoType: 'Textiles' },
    { origin: 'Baku, Azerbaijan', destination: 'Moscow, Russia', cargoType: 'Machinery' },
    { origin: 'Baku, Azerbaijan', destination: 'Dubai, UAE', cargoType: 'Food' },
    { origin: 'Sumgayit, Azerbaijan', destination: 'Shanghai, China', cargoType: 'Chemicals' },
    { origin: 'Baku, Azerbaijan', destination: 'Warsaw, Poland', cargoType: 'Electronics' },
  ]
  for (let m = 1; m <= 6; m++) {
    const pastDate = new Date(now)
    pastDate.setMonth(pastDate.getMonth() - m)
    const route = routes[m - 1]
    const pa = await prisma.announcement.create({
      data: {
        title: `${route.cargoType} Shipment — ${m} month${m > 1 ? 's' : ''} ago`,
        description: `Historical cargo for reporting purposes.`,
        cargoType: route.cargoType,
        weight: 3000 + m * 500,
        origin: route.origin,
        destination: route.destination,
        deadline: new Date(pastDate.getTime() + 7 * 86400000),
        status: 'CLOSED',
        supplierId: m % 2 === 0 ? supplier2.id : supplier1.id,
        createdAt: pastDate,
        updatedAt: pastDate,
        createdById: m % 3 === 0 ? supplierAdmin2.id : m % 3 === 1 ? supplierEmp1.id : supplierEmp2.id,
      },
    })
    pastAnns.push({ ann: pa, date: pastDate })
  }

  // ─── Current offers ───────────────────────────────────────────
  // ann1 (Electronics → Frankfurt): 2 offers, Swift ACCEPTED
  const offer1 = await prisma.offer.create({
    data: {
      announcementId: ann1.id,
      logisticsCompanyId: logistics1.id,
      notes: 'We have special handling equipment for electronics. Climate-controlled containers available.',
      status: 'ACCEPTED',
      submittedById: logisticsEmp1.id,
      items: {
        create: [
          { transportType: 'AIR', price: 8500, currency: 'USD', deliveryDays: 3, notes: 'Direct flight Frankfurt' },
          { transportType: 'SEA', price: 3200, currency: 'USD', deliveryDays: 21, notes: 'Via Black Sea - Constanta' },
        ],
      },
    },
  })

  const offer2 = await prisma.offer.create({
    data: {
      announcementId: ann1.id,
      logisticsCompanyId: logistics2.id,
      notes: 'Competitive pricing for air freight. Experienced team.',
      status: 'REJECTED',
      submittedById: logisticsAdmin2.id,
      items: {
        create: [
          { transportType: 'AIR', price: 9200, currency: 'USD', deliveryDays: 4 },
        ],
      },
    },
  })

  // ann2 (Textiles → Istanbul): 2 offers, PENDING
  const offer3 = await prisma.offer.create({
    data: {
      announcementId: ann2.id,
      logisticsCompanyId: logistics1.id,
      notes: 'Best rates for textile cargo to Turkey. Weekly departures.',
      status: 'PENDING',
      submittedById: logisticsEmp2.id,
      items: {
        create: [
          { transportType: 'ROAD', price: 1800, currency: 'USD', deliveryDays: 5, notes: 'Direct truck TIR' },
          { transportType: 'RAIL', price: 1200, currency: 'USD', deliveryDays: 8 },
        ],
      },
    },
  })

  const offer4 = await prisma.offer.create({
    data: {
      announcementId: ann2.id,
      logisticsCompanyId: logistics2.id,
      notes: 'Fast road delivery, reliable partner in Turkey.',
      status: 'PENDING',
      submittedById: logisticsEmp3.id,
      items: {
        create: [
          { transportType: 'ROAD', price: 1650, currency: 'USD', deliveryDays: 6 },
          { transportType: 'SEA', price: 980, currency: 'USD', deliveryDays: 14, notes: 'Via Batumi port' },
        ],
      },
    },
  })

  // ann3 (Machinery → Moscow): 2 offers, PENDING
  const offer5 = await prisma.offer.create({
    data: {
      announcementId: ann3.id,
      logisticsCompanyId: logistics2.id,
      notes: 'We specialize in heavy cargo. BTK railway corridor experience.',
      status: 'PENDING',
      submittedById: logisticsAdmin2.id,
      items: {
        create: [
          { transportType: 'RAIL', price: 5500, currency: 'USD', deliveryDays: 12, notes: 'BTK corridor' },
          { transportType: 'ROAD', price: 7200, currency: 'USD', deliveryDays: 8 },
        ],
      },
    },
  })

  const offer6 = await prisma.offer.create({
    data: {
      announcementId: ann3.id,
      logisticsCompanyId: logistics1.id,
      notes: 'Specialized heavy freight handling. Competitive rail pricing.',
      status: 'PENDING',
      submittedById: logisticsAdmin1.id,
      items: {
        create: [
          { transportType: 'RAIL', price: 5100, currency: 'USD', deliveryDays: 14 },
        ],
      },
    },
  })

  // ann4 (Food → Dubai): CLOSED with ACCEPTED offer
  const offer7 = await prisma.offer.create({
    data: {
      announcementId: ann4.id,
      logisticsCompanyId: logistics1.id,
      notes: 'Cold chain certified. Reefer containers available.',
      status: 'ACCEPTED',
      submittedById: logisticsAdmin1.id,
      items: {
        create: [
          { transportType: 'AIR', price: 6800, currency: 'USD', deliveryDays: 2, notes: 'Cargo airline, temp controlled' },
          { transportType: 'SEA', price: 2400, currency: 'USD', deliveryDays: 18 },
        ],
      },
    },
  })

  // ann6 (Agriculture → Georgia): 1 PENDING offer
  const offer8 = await prisma.offer.create({
    data: {
      announcementId: ann6.id,
      logisticsCompanyId: logistics2.id,
      notes: 'Refrigerated trucks available. Same-day pickup.',
      status: 'PENDING',
      submittedById: logisticsEmp3.id,
      items: {
        create: [
          { transportType: 'ROAD', price: 650, currency: 'USD', deliveryDays: 2 },
        ],
      },
    },
  })

  // ─── Past offers for historical data ─────────────────────────
  const transportTypes: ('AIR' | 'ROAD' | 'RAIL' | 'SEA')[] = ['AIR', 'ROAD', 'RAIL', 'SEA']
  for (let i = 0; i < pastAnns.length; i++) {
    const { ann, date } = pastAnns[i]
    const status1 = i % 3 === 0 ? 'ACCEPTED' : i % 3 === 1 ? 'REJECTED' : 'PENDING'
    const status2 = status1 === 'ACCEPTED' ? 'REJECTED' : 'REJECTED'
    const tType = transportTypes[i % 4]

    await prisma.offer.create({
      data: {
        announcementId: ann.id,
        logisticsCompanyId: logistics1.id,
        status: status1,
        submittedById: i % 2 === 0 ? logisticsEmp1.id : logisticsEmp2.id,
        createdAt: date,
        updatedAt: date,
        items: { create: [{ transportType: tType, price: 4500 + i * 400, currency: 'USD', deliveryDays: 4 + i }] },
      },
    })

    await prisma.offer.create({
      data: {
        announcementId: ann.id,
        logisticsCompanyId: logistics2.id,
        status: status2,
        submittedById: logisticsEmp3.id,
        createdAt: date,
        updatedAt: date,
        items: { create: [{ transportType: tType, price: 4800 + i * 300, currency: 'USD', deliveryDays: 5 + i }] },
      },
    })
  }

  // ─── Shipments for accepted offers ───────────────────────────
  const createShipment = async (offerId: string, status: any, milestones: any[]) => {
    await prisma.shipment.create({
      data: {
        offerId,
        status,
        milestones: { create: milestones },
      },
    })
  }

  await createShipment(offer1.id, 'IN_TRANSIT', [
    { status: 'BOOKED', note: 'Offer accepted, shipment booked', createdAt: dAgo(5) },
    { status: 'PICKED_UP', location: 'Baku International Airport', note: 'Cargo collected from warehouse', createdAt: dAgo(4) },
    { status: 'IN_TRANSIT', location: 'Istanbul, Turkey', note: 'Stopover in Istanbul, next stop Frankfurt', createdAt: dAgo(2) },
  ])

  await createShipment(offer7.id, 'DELIVERED', [
    { status: 'BOOKED', note: 'Offer accepted, shipment booked', createdAt: dAgo(20) },
    { status: 'PICKED_UP', location: 'Baku Cargo Terminal', createdAt: dAgo(19) },
    { status: 'IN_TRANSIT', location: 'Dubai Airport FZE', createdAt: dAgo(17) },
    { status: 'CUSTOMS_CLEARANCE', location: 'Dubai Customs', note: 'Documentation verified', createdAt: dAgo(16) },
    { status: 'OUT_FOR_DELIVERY', location: 'Dubai Distribution Center', createdAt: dAgo(15) },
    { status: 'DELIVERED', location: 'Dubai, UAE', note: 'Delivered in perfect condition', createdAt: dAgo(15) },
  ])

  // ─── Offer Comments ───────────────────────────────────────────
  // Comments on offer3 (ann2 Textiles - Swift, PENDING)
  await prisma.offerComment.createMany({
    data: [
      {
        offerId: offer3.id,
        authorId: supplierEmp2.id,
        content: 'Can you guarantee climate control for the textiles during transport? We have some delicate fabrics.',
        createdAt: dAgo(3),
      },
      {
        offerId: offer3.id,
        authorId: logisticsEmp2.id,
        content: 'Yes, our TIR trucks are fully weatherproof and we can add protective packaging. No problem at all.',
        createdAt: dAgo(2),
      },
      {
        offerId: offer3.id,
        authorId: supplierEmp2.id,
        content: 'Great, and do you have experience with Turkish customs? We need quick clearance.',
        createdAt: dAgo(1),
      },
      {
        offerId: offer3.id,
        authorId: logisticsEmp2.id,
        content: 'Absolutely — we have a dedicated customs agent in Istanbul. Average clearance time is 4 hours.',
        createdAt: dAgo(0),
      },
    ],
  })

  // Comments on offer5 (ann3 Machinery - Baku Express, PENDING)
  await prisma.offerComment.createMany({
    data: [
      {
        offerId: offer5.id,
        authorId: supplierAdmin2.id,
        content: 'We have one oversized piece — 4.5m x 2.2m x 2.8m, 3.2 tons. Can you handle this on the rail option?',
        createdAt: dAgo(5),
      },
      {
        offerId: offer5.id,
        authorId: logisticsAdmin2.id,
        content: 'Yes, BTK flatcar wagons can handle up to 5m length. We will arrange special permit documentation.',
        createdAt: dAgo(4),
      },
    ],
  })

  // Comments on offer1 (Accepted - Electronics)
  await prisma.offerComment.createMany({
    data: [
      {
        offerId: offer1.id,
        authorId: supplierEmp1.id,
        content: 'Offer accepted! Please confirm pickup date — we need at least 48 hours notice.',
        createdAt: dAgo(6),
      },
      {
        offerId: offer1.id,
        authorId: logisticsEmp1.id,
        content: 'Confirmed! Pickup scheduled for day after tomorrow, 09:00. Our team will be at your warehouse.',
        createdAt: dAgo(5),
      },
    ],
  })

  // ─── Notifications ────────────────────────────────────────────
  // For supplier admins — new offers received
  await prisma.notification.createMany({
    data: [
      {
        userId: supplierEmp2.id,
        type: 'NEW_OFFER',
        title: 'New offer received',
        body: 'Swift Cargo submitted an offer for "Textile Products to Turkey"',
        relatedId: ann2.id,
        isRead: false,
        createdAt: dAgo(3),
      },
      {
        userId: supplierEmp2.id,
        type: 'NEW_OFFER',
        title: 'New offer received',
        body: 'Baku Express Freight submitted an offer for "Textile Products to Turkey"',
        relatedId: ann2.id,
        isRead: false,
        createdAt: dAgo(2),
      },
      {
        userId: supplierAdmin2.id,
        type: 'NEW_OFFER',
        title: 'New offer received',
        body: 'Baku Express Freight submitted an offer for "Machinery Parts to Russia"',
        relatedId: ann3.id,
        isRead: true,
        createdAt: dAgo(5),
      },
      {
        userId: supplierAdmin1.id,
        type: 'NEW_OFFER',
        title: 'New offer received',
        body: 'Baku Express Freight submitted an offer for "Agricultural Products to Georgia"',
        relatedId: ann6.id,
        isRead: false,
        createdAt: dAgo(1),
      },
    ],
  })

  // For logistics — offer status changes
  await prisma.notification.createMany({
    data: [
      {
        userId: logisticsEmp1.id,
        type: 'OFFER_ACCEPTED',
        title: 'Offer accepted!',
        body: 'Your offer for "Electronics Cargo to Germany" was accepted. Check shipment details.',
        relatedId: offer1.id,
        isRead: true,
        createdAt: dAgo(6),
      },
      {
        userId: logisticsAdmin2.id,
        type: 'OFFER_REJECTED',
        title: 'Offer rejected',
        body: 'Your offer for "Electronics Cargo to Germany" was not selected.',
        relatedId: offer2.id,
        isRead: false,
        createdAt: dAgo(6),
      },
      {
        userId: logisticsAdmin1.id,
        type: 'OFFER_ACCEPTED',
        title: 'Offer accepted!',
        body: 'Your offer for "Food Products to UAE" was accepted.',
        relatedId: offer7.id,
        isRead: true,
        createdAt: dAgo(20),
      },
    ],
  })

  // Comment notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: logisticsEmp2.id,
        type: 'NEW_COMMENT',
        title: 'New comment on your offer',
        body: 'Tural Aliyev: "Can you guarantee climate control for the textiles during transport?"',
        relatedId: offer3.id,
        isRead: false,
        createdAt: dAgo(3),
      },
      {
        userId: supplierEmp2.id,
        type: 'NEW_COMMENT',
        title: 'Reply to your comment',
        body: 'Rashad Bagirov: "Yes, our TIR trucks are fully weatherproof and we can add protective packaging."',
        relatedId: offer3.id,
        isRead: false,
        createdAt: dAgo(2),
      },
    ],
  })

  console.log('✅ Seed completed!')
  console.log('\nTest accounts:')
  console.log('Admin:     admin@platform.com   / admin123')
  console.log('Supplier:  supplier@azimport.az / supplier123')
  console.log('Logistics: logistics@swiftcargo.az / logistics123')
  console.log('Unverified: test@newstartup.az  / test123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
