import { PrismaClient } from '@prisma/client';
import { Password } from '../src/auth/helpers/password';

const prisma = new PrismaClient();

const seedDown = async () => {
  await prisma.user.deleteMany({});
  await prisma.sacrament.deleteMany({});
};

const seedUp = async () => {
  await seedDown();
  //seed users
  await prisma.user.createMany({
    data: [
      {
        email: 'clergy@gmail.com',
        username: 'Clergy',
        password: await Password.hashPassword('Password@123', 10),
        firstName: 'Clergy',
        lastName: 'One',
        role: 'CLERGY',
        state: 'VERIFIED',
      },
      {
        email: 'highpriest@gmail.com',
        username: 'High',
        firstName: 'High',
        lastName: 'Priest',
        password: await Password.hashPassword('Password@123', 10),
        role: 'HIGH_PRIEST',
        state: 'VERIFIED',
      },
      {
        email: 'christian@gmail.com',
        username: 'christian',
        firstName: 'christian',
        lastName: 'None',
        password: await Password.hashPassword('Password@123', 10),
        role: 'CHRISTIAN',
        state: 'VERIFIED',
      },
    ],
  });

  const christian = await prisma.user.findFirst({
    where: {
      role: 'CHRISTIAN',
    },
  });

  await prisma.christian.create({
    data: {
      uniqueCode: '1111',
      motherName: 'Mother Christian',
      fatherName: 'Father Christian',
      province: 'Kigali',
      district: 'GASABO',
      homeAddress: 'REMERA',
      dob: new Date(),
      user: {
        connect: {
          id: christian.id,
        },
      },
    },
  });

  await prisma.sacrament.createMany({
    data: [
      {
        name: 'Eucharist',
        description:
          'The Eucharist is a Christian rite that is considered a sacrament in most churches, and as an ordinance in others.',
      },
      {
        name: 'Baptism',
        description:
          'Baptism is a Christian rite of admission and adoption, almost invariably with the use of water, into Christianity.',
      },
      {
        name: 'Confirmation',
        description:
          'Confirmation is a rite of initiation in Christian churches, normally carried out through anointing, the laying on of hands, and prayer for the Holy Spirit.',
      },
      {
        name: 'Reconciliation',
        description:
          'The Sacrament of Penance and Reconciliation is one of the seven sacraments of the Catholic Church, in which the faithful are absolved from sins committed after Baptism and they are reconciled with the Christian community.',
      },
      {
        name: 'Anointing of the Sick',
        description:
          'Anointing of the Sick is a sacrament of the Catholic Church that is administered to a Catholic "who, having reached the age of reason, begins to be in danger due to sickness or old age".',
      },
      {
        name: 'Marriage',
        description:
          'The Sacrament of Marriage, also known as Holy Matrimony, is a Catholic Church ceremony in which',
      },
      {
        name: 'Ordination',
        description:
          'Ordination, or Holy Orders, is a sacrament that is available only to men who are being ordained as deacons, priests, or bishops. As with Baptism and Confirmation, the sacrament is said to convey a special indelible “character” on the soul of the recipient..',
      },
    ],
  });

  await prisma.parish.create({
    data: {
      parishName: 'Saint Michelle',
      diocese: 'Saint Mary',
    },
  });
};

seedUp().then(() => {
  console.log('Seeding completed');
  prisma.$disconnect();
  process.exit(0);
});

export { seedDown, seedUp };
