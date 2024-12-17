import type UserDomainEntity from '@/domain/entities/user.domain.entity'

export default interface LoadUsersRepository {
  all: () => Promise<LoadUsersOutput>
}

export type LoadUsersOutput = UserDomainEntity[]