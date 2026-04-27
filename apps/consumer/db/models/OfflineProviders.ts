import { Model } from '@nozbe/watermelondb'
import { field, date } from '@nozbe/watermelondb/decorators'

export class OfflineProviders extends Model {
  static table = 'offline_providers'

  @field('city') city!: string
  @field('data_json') dataJson!: string

  @date('last_synced_at') lastSyncedAt!: number

  // Helper to parse provider data
  getParsedData() {
    try {
      return JSON.parse(this.dataJson);
    } catch (err) {
      console.error('Error parsing offline provider data:', err);
      return [];
    }
  }
}
