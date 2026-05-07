const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({});

async function main() {
  // Create Admin
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedAdminPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Create Health Worker
  const hashedWorkerPassword = await bcrypt.hash('worker123', 10);
  const worker = await prisma.user.upsert({
    where: { username: 'worker1' },
    update: {},
    create: {
      username: 'worker1',
      password: hashedWorkerPassword,
      name: 'Nakes Desa 1',
      role: 'HEALTH_WORKER',
    },
  });

  console.log({ worker });

  // Create Village Head
  const hashedHeadPassword = await bcrypt.hash('kades123', 10);
  const villageHead = await prisma.user.upsert({
    where: { username: 'kades' },
    update: {},
    create: {
      username: 'kades',
      password: hashedHeadPassword,
      name: 'Kepala Desa',
      role: 'VILLAGE_HEAD',
    },
  });

  console.log({ villageHead });

  // Create a patient
  const patient = await prisma.patient.create({
    data: {
      name: 'Budi Santoso',
      age: 45,
      gender: 'MALE',
      address: 'Dusun Sukamaju RT 01 RW 02',
    },
  });

  console.log({ patient });

  // Create medical record for patient
  const record = await prisma.medicalRecord.create({
    data: {
      patientId: patient.id,
      bloodPressure: '145/95', // Warning
      bloodSugar: 210, // Warning
      cholesterol: 250,
      weight: 80,
      height: 165,
      smokingStatus: true,
      activityLevel: 'LOW',
    },
  });

  console.log({ record });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
