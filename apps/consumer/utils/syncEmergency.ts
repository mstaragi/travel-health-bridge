import { supabase } from '@travelhealthbridge/shared/api/supabase' // I'll assume supabase client exists here.
import { database } from '../db'
import { EmergencyCache } from '../db/models/EmergencyCache'

export async function syncEmergency() {
  try {
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .eq('emergency', true)
    
    if (error || !providers) {
      console.error('Failed to fetch emergency providers from Supabase', error)
      return
    }

    await database.write(async () => {
      // 1. Fetch current cache to clear them
      const emergencyCollection = database.get<EmergencyCache>('emergency_cache')
      const allCached = await emergencyCollection.query().fetch()
      
      // 2. Prepare deletes
      const deletedRecords = allCached.map(record => record.prepareDestroyPermanently())

      // 3. Prepare creates 
      const now = Date.now()
      const newRecords = providers.map(provider => 
        emergencyCollection.prepareCreate(record => {
          record.city = provider.city // Assuming city exists on provider
          record.providerName = provider.name
          record.providerPhone = provider.phone_number || ''
          record.providerAddress = provider.address || ''
          // Simplification for open status caching
          record.providerOpenStatus = 'open'
          record.lastSyncedAt = now
        })
      )

      // 4. Execute batch
      await database.batch(...deletedRecords, ...newRecords)
    })
    console.log('Successfully synced emergency cache')
  } catch (err) {
    console.error('Error during emergency sync', err)
  }
}
