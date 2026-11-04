import { Prisma, type PrismaClient } from '../../generated/prisma';

type Input = { userId: string; templateId: string; competence: string; amount: string; description: string };
export class ReservationConflict extends Error {}
export async function reserveTransmission(db: PrismaClient, input: Input, sign: (number: number) => { id: string; xml: string }) {
  if (!/^\d{4}-\d{2}-01$/.test(input.competence) || new Date(input.competence).toISOString().slice(0, 10) !== input.competence) throw new Error('Use o primeiro dia do mês de competência.');
  let emission = await db.nfseEmission.findFirst({ where: { userId: input.userId, templateId: input.templateId, competence: input.competence } });
  if (!emission) {
    try { emission = await db.nfseEmission.create({ data: input }); }
    catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
      emission = await db.nfseEmission.findFirstOrThrow({ where: { userId: input.userId, templateId: input.templateId, competence: input.competence } });
    }
  }
  if (!['prepared', 'rejected'].includes(emission.status)) throw new ReservationConflict('Já existe uma transmissão para esse mês. Consulte seu resultado antes de continuar.');
  // Uma falha de assinatura deixa a reserva preparada: nenhum envio ocorreu, e pode ser retomada.
  const dps = sign(emission.number);
  const claim = await db.nfseEmission.updateMany({ where: { id: emission.id, userId: input.userId, status: emission.status, updatedAt: emission.updatedAt }, data: {
    amount: input.amount, description: input.description, dpsId: dps.id, signedXml: dps.xml,
    status: 'sending', response: Prisma.DbNull, accessKey: null,
  } });
  if (claim.count !== 1) throw new ReservationConflict('Outra solicitação já está processando este mês. Consulte o histórico.');
  return { ...emission, amount: input.amount, description: input.description, dpsId: dps.id, signedXml: dps.xml, status: 'sending' };
}
