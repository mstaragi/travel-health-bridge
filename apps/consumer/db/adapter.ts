import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import schema from './schema'

export default new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
})
