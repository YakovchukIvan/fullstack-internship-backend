import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { CompanyMember } from '@/modules/companies/entities/company-member.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { AppLogger } from '@/common/logger/app-logger';

export interface CompanySeedResult {
  companies: Company[];
  allMembers: Partial<CompanyMember>[];
  companyMembersMap: Map<string, string[]>;
}

const COMPANIES_CREATED_AT = new Date('2025-02-01T00:00:00.000Z');

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function seedCompanies(
  dataSource: DataSource,
  users: User[],
  logger: AppLogger,
): Promise<CompanySeedResult> {
  logger.log('🏢 Creating 10 companies...', 'CompaniesSeeder');

  const ownerAdminPool = users.slice(0, 20);
  const crossoverPool = users.slice(20, 50);
  const regularPool = users.slice(50);

  const companies: Company[] = [];
  const allMembers: Partial<CompanyMember>[] = [];
  const companyMembersMap = new Map<string, string[]>();

  for (let i = 0; i < 10; i++) {
    const owner = ownerAdminPool[i * 2];
    const admin = ownerAdminPool[i * 2 + 1];

    const companyName = faker.company.name();
    const slug = toSlug(companyName) + `-${i}`;

    const inserted = await dataSource
      .createQueryBuilder()
      .insert()
      .into(Company)
      .values({
        name: companyName,
        slug,
        description: faker.company.catchPhrase(),
        avatarUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
        isVisible: true,
        ownerId: owner.id,
        membersCount: 0,
        createdAt: COMPANIES_CREATED_AT,
        updatedAt: COMPANIES_CREATED_AT,
      })
      .returning('*')
      .execute();

    const company = inserted.generatedMaps[0] as Company;
    companies.push(company);

    const memberUserIds: string[] = [owner.id, admin.id];

    allMembers.push(
      {
        userId: owner.id,
        companyId: company.id,
        role: CompanyRole.OWNER,
        createdAt: COMPANIES_CREATED_AT,
        updatedAt: COMPANIES_CREATED_AT,
      },
      {
        userId: admin.id,
        companyId: company.id,
        role: CompanyRole.ADMIN,
        createdAt: COMPANIES_CREATED_AT,
        updatedAt: COMPANIES_CREATED_AT,
      },
    );

    const crossovers = faker.helpers.arrayElements(crossoverPool, faker.number.int({ min: 3, max: 5 }));
    for (const u of crossovers) {
      allMembers.push({
        userId: u.id,
        companyId: company.id,
        role: CompanyRole.MEMBER,
        createdAt: COMPANIES_CREATED_AT,
        updatedAt: COMPANIES_CREATED_AT,
      });
      memberUserIds.push(u.id);
    }

    const regulars = regularPool.splice(0, faker.number.int({ min: 5, max: 7 }));
    for (const u of regulars) {
      allMembers.push({
        userId: u.id,
        companyId: company.id,
        role: CompanyRole.MEMBER,
        createdAt: COMPANIES_CREATED_AT,
        updatedAt: COMPANIES_CREATED_AT,
      });
      memberUserIds.push(u.id);
    }

    companyMembersMap.set(company.id, memberUserIds);
  }

  await dataSource.createQueryBuilder().insert().into(CompanyMember).values(allMembers).execute();

  for (const company of companies) {
    const count = companyMembersMap.get(company.id)?.length ?? 0;
    await dataSource
      .createQueryBuilder()
      .update(Company)
      .set({ membersCount: count })
      .where('id = :id', { id: company.id })
      .execute();
  }

  logger.log(`✅ ${companies.length} companies, ${allMembers.length} members created`, 'CompaniesSeeder');
  return { companies, allMembers, companyMembersMap };
}
