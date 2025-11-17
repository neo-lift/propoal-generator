import { PrismaClient } from '@/generated/prisma/client';

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }
  return prisma;
}

export interface ProposalLogData {
  customerEmail: string;
  proposalUuid: string;
  summary: string;
  companyName?: string;
  eventType?: string;
}

export async function logGeneratedProposal(
  data: ProposalLogData,
  customPrisma?: PrismaClient,
): Promise<number> {
  const client = customPrisma || getPrismaClient();

  try {
    const result = await client.proposalLog.create({
      data: {
        customerEmail: data.customerEmail,
        proposalUuid: data.proposalUuid,
        summary: data.summary,
        companyName: data.companyName,
        eventType: data.eventType,
      },
      select: {
        id: true,
      },
    });

    return result.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to log proposal:', error);

    // In production, we might want to fail gracefully instead of throwing
    if (process.env.NODE_ENV === 'production') {
      console.error('Database logging failed, continuing without logging');
      return -1; // Indicate logging failed but don't break the flow
    }

    throw new Error(`Failed to log proposal: ${message}`);
  }
}

export async function getRecentProposals(limit: number = 10): Promise<
  Array<{
    id: number;
    createdAt: Date;
    customerEmail: string;
    proposalUuid: string;
    summary: string;
    companyName?: string;
    eventType?: string;
  }>
> {
  const client = getPrismaClient();

  try {
    const proposals = await client.proposalLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        customerEmail: true,
        proposalUuid: true,
        summary: true,
        companyName: true,
        eventType: true,
      },
    });

    // Convert null to undefined for consistent typing
    return proposals.map(proposal => ({
      ...proposal,
      companyName: proposal.companyName ?? undefined,
      eventType: proposal.eventType ?? undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch recent proposals:', error);
    return [];
  }
}

export async function findProposalsByEmail(email: string): Promise<
  Array<{
    id: number;
    createdAt: Date;
    proposalUuid: string;
    summary: string;
    companyName?: string;
    eventType?: string;
  }>
> {
  const client = getPrismaClient();

  try {
    const proposals = await client.proposalLog.findMany({
      where: {
        customerEmail: email,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        createdAt: true,
        proposalUuid: true,
        summary: true,
        companyName: true,
        eventType: true,
      },
    });

    // Convert null to undefined for consistent typing
    return proposals.map(proposal => ({
      ...proposal,
      companyName: proposal.companyName ?? undefined,
      eventType: proposal.eventType ?? undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch proposals by email:', error);
    return [];
  }
}

// Gracefully disconnect Prisma client
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
