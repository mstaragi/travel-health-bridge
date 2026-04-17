import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'

export default new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error: any) => console.error(error)
})
