import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { CreateCompanyDto } from './dto/req/create-company.dto';
import { UpdateCompanyDto } from './dto/req/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<Company> {
    const company = this.companyRepository.create({
      ...createCompanyDto,
      ownerId: userId,
    });

    return this.companyRepository.save(company);
  }

  async findAll(userRole?: UserRole): Promise<Company[]> {
    if (userRole === UserRole.OWNER) {
      return this.companyRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['owner'],
      });
    }

    return this.companyRepository.find({
      where: { isVisible: true },
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    });
  }

  async findOne(id: string, userRole?: UserRole): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    if (!company.isVisible && userRole !== UserRole.OWNER) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);

    Object.assign(company, updateCompanyDto);

    return this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companyRepository.remove(company);
  }

  async findByOwnerId(ownerId: string): Promise<Company[]> {
    return this.companyRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }
}
