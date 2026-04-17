import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export class VisitHistory extends Model {
  static table = 'visit_history'

  @field('provider_id') providerId!: string
  @field('provider_name') providerName!: string
  @field('visit_date') visitDate!: string
  @field('diagnosis') diagnosis!: string
  @field('documents_json') documentsJson!: string
  @field('sync_status') syncStatus!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
