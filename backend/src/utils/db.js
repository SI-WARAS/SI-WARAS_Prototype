const { PrismaClient } = require('@prisma/client');
const { AsyncLocalStorage } = require('async_hooks');

const prismaStorage = new AsyncLocalStorage();
const basePrisma = new PrismaClient();

const prisma = basePrisma.$extends({
  query: {
    patient: {
      async $allOperations({ model, operation, args, query }) {
        const user = prismaStorage.getStore();
        
        // If user is logged in and is NOT an ADMIN or VILLAGE_HEAD (both bypass scoping)
        if (user && user.role !== 'ADMIN' && user.role !== 'VILLAGE_HEAD') {
          const pedukuhanId = user.pedukuhanId || null;

          if (operation === 'create') {
            args.data = args.data || {};
            args.data.pedukuhanId = pedukuhanId;
          } else if (operation === 'createMany') {
            if (Array.isArray(args.data)) {
              args.data.forEach(item => {
                item.pedukuhanId = pedukuhanId;
              });
            } else if (args.data) {
              args.data.pedukuhanId = pedukuhanId;
            }
          } else if (operation === 'findUnique') {
            // Convert findUnique to findFirst to avoid Prisma's strict unique constraints in where clause
            const where = { ...args.where, pedukuhanId };
            return basePrisma.patient.findFirst({
              ...args,
              where
            });
          } else if (['findMany', 'findFirst', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
            args.where = args.where || {};
            args.where.pedukuhanId = pedukuhanId;
          }
        }
        return query(args);
      }
    },
    medicalRecord: {
      async $allOperations({ model, operation, args, query }) {
        const user = prismaStorage.getStore();
        
        if (user && user.role !== 'ADMIN' && user.role !== 'VILLAGE_HEAD') {
          const pedukuhanId = user.pedukuhanId || null;

          if (operation === 'findUnique') {
            // Convert findUnique to findFirst to bypass unique constraint errors with nested filters
            const where = {
              ...args.where,
              patient: { pedukuhanId }
            };
            return basePrisma.medicalRecord.findFirst({
              ...args,
              where
            });
          } else if (['findMany', 'findFirst', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
            args.where = args.where || {};
            args.where.patient = args.where.patient || {};
            args.where.patient.pedukuhanId = pedukuhanId;
          }
        }
        return query(args);
      }
    }
  }
});

module.exports = {
  prisma,
  prismaStorage,
  basePrisma
};
