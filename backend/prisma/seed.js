const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({});

async function main() {
  // Clear existing data to avoid conflicts during seed
  await prisma.medicalRecord.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.pedukuhan.deleteMany({});

  // Seed Pedukuhan
  const PADUKUHAN_LIST = [
    'Gluntung Kidul', 'Gumulan', 'Tegalsempu', 'Tunjungan', 'Krapakan', 
    'Samparan', 'Tegallayang 9', 'Tegallayang 10', 'Kuroboyo', 'Korowelang', 
    'Glagahan', 'Bogem', 'Banyuurip', 'Gluntung Lor'
  ];

  const pedukuhanInstances = [];
  for (const name of PADUKUHAN_LIST) {
    const p = await prisma.pedukuhan.create({
      data: { name }
    });
    pedukuhanInstances.push(p);
  }
  console.log(`Seeded ${pedukuhanInstances.length} pedukuhans.`);

  // Helper map
  const getPedukuhanId = (name) => pedukuhanInstances.find(p => p.name === name)?.id;

  // Create Admin
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedAdminPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Create Health Worker
  const hashedWorkerPassword = await bcrypt.hash('worker123', 10);
  const worker = await prisma.user.create({
    data: {
      username: 'worker1',
      password: hashedWorkerPassword,
      name: 'Nakes Desa 1',
      role: 'HEALTH_WORKER',
      pedukuhanId: getPedukuhanId('Gluntung Kidul'),
    },
  });

  console.log({ worker });

  // Create Village Head
  const hashedHeadPassword = await bcrypt.hash('kades123', 10);
  const villageHead = await prisma.user.create({
    data: {
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
      nik: '3402160101780001',
      name: 'Budi Santoso',
      age: 45,
      gender: 'MALE',
      address: 'Dusun Gluntung Kidul RT 01',
      pedukuhanId: getPedukuhanId('Gluntung Kidul'),
    },
  });

  console.log({ patient });

  // Create medical record for patient (calculating thresholds)
  const weight = 80;
  const height = 165;
  const heightMeters = height / 100;
  const bmi = parseFloat((weight / (heightMeters * heightMeters)).toFixed(2));

  const record = await prisma.medicalRecord.create({
    data: {
      patientId: patient.id,
      bloodPressure: '145/95',
      bloodSugar: 210,
      cholesterol: 250,
      uricAcid: 6.5,
      weight,
      height,
      smokingStatus: true,
      activityLevel: 'LOW',
      bmi,
      bloodPressureStatus: 'bahaya', // 145/95 is bahaya (>= 140/90)
      bloodSugarStatus: 'bahaya',    // 210 is bahaya (>= 200)
      cholesterolStatus: 'bahaya',   // 250 is bahaya (>= 200)
      uricAcidStatus: 'waspada',     // 6.5 is waspada (> 6.0 for MALE)
      isRisk: true,
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
