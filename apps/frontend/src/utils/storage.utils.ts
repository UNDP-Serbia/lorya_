export const storageUtils = {
  set<T>(key: string, value: T): Promise<void> {
    return new Promise(resolve => {
      try {
        const serializedValue = JSON.stringify(value)
        localStorage.setItem(key, serializedValue)
      } catch (error) {
        console.error(`[storageUtils.set] Error saving "${key}"`, error)
      } finally {
        resolve()
      }
    })
  },
  get<T>(key: string): Promise<T | null> {
    return new Promise(resolve => {
      try {
        const storedValue = localStorage.getItem(key)
        if (!storedValue) return resolve(null)
        const parsed = JSON.parse(storedValue) as T
        resolve(parsed)
      } catch (error) {
        console.error(`[storageUtils.get] Error reading "${key}"`, error)
        resolve(null)
      }
    })
  },
  remove(key: string): Promise<void> {
    return new Promise(resolve => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`[storageUtils.remove] Error removing "${key}"`, error)
      } finally {
        resolve()
      }
    })
  },
  removeMultiple(keys: string[]): Promise<void> {
    return new Promise(resolve => {
      try {
        keys.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.error(
          `[storageUtils.removeMultiple] Error removing keys`,
          error
        )
      } finally {
        resolve()
      }
    })
  },
}
