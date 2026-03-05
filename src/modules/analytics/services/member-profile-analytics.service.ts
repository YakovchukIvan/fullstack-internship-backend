import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnalyticsRepository } from '../repositories/user-analytics.repository';
import { toUserAnalyticsProfileDto } from '../mappers/user-profile.mapper';
import { UserAnalyticsProfileDto } from '../dto/res/user-profile.res.dto';
import { UserAnalyticsQueryParams } from '../interfaces/user.interfaces';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class MemberProfileAnalyticsService {
  constructor(
    private readonly userAnalyticsRepository: UserAnalyticsRepository,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getMemberProfile(userId: string, companyId: string): Promise<UserAnalyticsProfileDto> {
    const queryParams: UserAnalyticsQueryParams = { userId, companyId };

    const [user, dates, ratingRaw, dynamicsRows, performanceRaw, durationStats, lastAttemptsRaw] = await Promise.all([
      this.userRepository.findOneOrFail({ where: { id: userId } }),
      this.userAnalyticsRepository.getUserAttemptDates(queryParams),
      this.userAnalyticsRepository.getUserRatingInCompany(userId, companyId),
      this.userAnalyticsRepository.getUserScoreDynamics(queryParams),
      this.userAnalyticsRepository.getUserAttemptsForPerformance(queryParams),
      this.userAnalyticsRepository.getUserDurationStats(queryParams),
      this.userAnalyticsRepository.getUserLastAttempts(userId, companyId),
    ]);

    return toUserAnalyticsProfileDto({
      user,
      dates,
      ratingRaw,
      dynamicsRows,
      performanceRaw,
      durationStats,
      lastAttemptsRaw,
    });
  }
}
