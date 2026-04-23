import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

export class EmergencyCache extends Model {
  static table = 'emergency_cache'

  @field('city') city!: string
  @field('provider_name') providerName!: string
  @field('provider_phone') providerPhone!: string
  @field('provider_address') providerAddress!: string
  @field('provider_open_status') providerOpenStatus!: string

  @date('last_synced_at') lastSyncedAt!: number
}
