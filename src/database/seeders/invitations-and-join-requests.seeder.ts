import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { CompanyMember } from '@/modules/companies/entities/company-member.entity';
import { CompanyInvitation } from '@/modules/companies/entities/company-invitation.entity';
import { CompanyJoinRequest } from '@/modules/companies/entities/company-join-request.entity';
import { InvitationStatus } from '@/modules/companies/enums/invitation-status.enum';
import { AppLogger } from '@/common/logger/app-logger';

export async function seedInvitations(
  dataSource: DataSource,
  users: User[],
  companies: Company[],
  allMembers: Partial<CompanyMember>[],
  companyMembersMap: Map<string, string[]>,
  logger: AppLogger,
): Promise<void> {
  logger.log('📨 Creating invitations and join requests...', 'InvitationsSeeder');

  const memberUserIds = new Set(allMembers.map((m) => m.userId));
  const nonMembers = users.filter((u) => !memberUserIds.has(u.id));

  const invitationsData: Partial<CompanyInvitation>[] = [];
  const joinRequestsData: Partial<CompanyJoinRequest>[] = [];

  const invitedPairs = new Set<string>();
  const requestedPairs = new Set<string>();

  const status = InvitationStatus.PENDING;

  for (const company of companies) {
    const memberIds = companyMembersMap.get(company.id) ?? [];
    const inviterId = memberIds[0];

    if (!inviterId) {
      continue;
    }

    const inviteCount = faker.number.int({ min: 3, max: 5 });
    const inviteCandidates = faker.helpers.arrayElements(nonMembers, Math.min(inviteCount, nonMembers.length));

    for (const u of inviteCandidates) {
      const pair = `${u.id}:${company.id}`;
      if (invitedPairs.has(pair)) {
        continue;
      }
      invitedPairs.add(pair);

      invitationsData.push({
        userId: u.id,
        companyId: company.id,
        invitedBy: inviterId,
        message: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? null,
        status,
      });
    }

    const notInvited = nonMembers.filter((u) => !inviteCandidates.includes(u));
    const requestCount = faker.number.int({ min: 2, max: 4 });
    const requestCandidates = faker.helpers.arrayElements(notInvited, Math.min(requestCount, notInvited.length));

    for (const u of requestCandidates) {
      const pair = `${u.id}:${company.id}`;
      if (requestedPairs.has(pair)) {
        continue;
      }
      requestedPairs.add(pair);

      joinRequestsData.push({
        userId: u.id,
        companyId: company.id,
        status,
      });
    }
  }

  if (invitationsData.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(CompanyInvitation)
      .values(invitationsData as CompanyInvitation[])
      .execute();
  }

  if (joinRequestsData.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(CompanyJoinRequest)
      .values(joinRequestsData as CompanyJoinRequest[])
      .execute();
  }

  logger.log(
    `✅ ${invitationsData.length} invitations, ${joinRequestsData.length} join requests created`,
    'InvitationsSeeder',
  );
}
