import { PrismaClient } from '@/generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Function to create a new PrismaClient with error handling
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Add error handling for connection issues
  // Uncomment these if you need detailed logging
  // client.$on('query', (e: any) => {
  //   console.log('Query:', e.query);
  //   console.log('Params:', e.params);
  //   console.log('Duration:', e.duration, 'ms');
  // });

  // client.$on('error', (e: any) => {
  //   console.error('Prisma Client error:', e);
  // });

  return client;
}

// Use existing client if available, otherwise create a new one
export const prisma = globalForPrisma.prisma || createPrismaClient();

// Save the client to the global object in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
