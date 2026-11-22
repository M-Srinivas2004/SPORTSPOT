import prisma from '../config/db';

export async function logAudit(
  userId: string | null,
  action: string,
  resource: string,
  details?: Record<string, any> | string,
  ipAddress?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        resource,
        details: typeof details === 'object' ? JSON.stringify(details) : details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
