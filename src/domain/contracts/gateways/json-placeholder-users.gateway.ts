import type UserDomainEntity from '@/domain/entities/user.domain.entity'

// domain/contracts/gateway
export interface LoadJSONPlaceholderUsersGateway {
  all: () => Promise<LoadJSONPlaceholderUsersOutput>
}
export type LoadJSONPlaceholderUsersOutput = UserDomainEntity[]