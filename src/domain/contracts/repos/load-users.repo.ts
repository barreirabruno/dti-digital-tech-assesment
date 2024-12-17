import type UserDomainEntity from '@/domain/entities/user.domain.entity'

export default interface LoadUsersRepository {
  all: () => Promise<LoadUsersRepositoryOutput>
}
export type LoadUsersRepositoryOutput = UserDomainEntity[]