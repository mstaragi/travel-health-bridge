import { Database } from '@nozbe/watermelondb'
import adapter from './adapter'
import schema from './schema'
import { EmergencyCache } from './models/EmergencyCache'
import { VaultEntry } from './models/VaultEntry'
import { VisitHistory } from './models/VisitHistory'

export const database = new Database({
  adapter,
  modelClasses: [EmergencyCache, VaultEntry, VisitHistory],
})

