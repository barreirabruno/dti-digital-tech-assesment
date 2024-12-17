import type UserDomainEntity from '@/domain/entities/user.domain.entity'

export default interface LoadUsersUseCase {
  all: () => Promise<LoadUsersOutput>
}

export type LoadUsersOutput = UserDomainEntity[]