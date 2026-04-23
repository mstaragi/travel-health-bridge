import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

export class VaultEntry extends Model {
  static table = 'vault_entries'

  @field('user_id') userId!: string
  @field('blood_group') bloodGroup?: string
  @field('allergies_json') allergiesJson?: string
  @field('medications_json') medicationsJson?: string
  @field('emergency_contacts_json') emergencyContactsJson?: string
  @field('insurer_name') insurerName?: string
  @field('insurer_policy') insurerPolicy?: string
  @field('insurer_helpline') insurerHelpline?: string

  @date('last_synced_at') lastSyncedAt!: number
}
