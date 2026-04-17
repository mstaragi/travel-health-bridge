import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'emergency_cache',
      columns: [
        { name: 'city', type: 'string', isIndexed: true },
        { name: 'provider_name', type: 'string' },
        { name: 'provider_phone', type: 'string' },
        { name: 'provider_address', type: 'string' },
        { name: 'provider_open_status', type: 'string' },
        { name: 'last_synced_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'offline_providers',
      columns: [
        { name: 'city', type: 'string', isIndexed: true },
        { name: 'data_json', type: 'string' },
        { name: 'last_synced_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'unsynced_events',
      columns: [
        { name: 'event_name', type: 'string' },
        { name: 'payload_json', type: 'string' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'vault_entries',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'blood_group', type: 'string', isOptional: true },
        { name: 'allergies_json', type: 'string', isOptional: true },
        { name: 'medications_json', type: 'string', isOptional: true },
        { name: 'emergency_contacts_json', type: 'string', isOptional: true },
        { name: 'insurer_name', type: 'string', isOptional: true },
        { name: 'insurer_policy', type: 'string', isOptional: true },
        { name: 'insurer_helpline', type: 'string', isOptional: true },
        { name: 'last_synced_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'visit_history',
      columns: [
        { name: 'provider_id', type: 'string', isIndexed: true },
        { name: 'provider_name', type: 'string' },
        { name: 'visit_date', type: 'string' },
        { name: 'diagnosis', type: 'string' },
        { name: 'documents_json', type: 'string' },
        { name: 'sync_status', type: 'string' },
      ]
    })
  ]
})
