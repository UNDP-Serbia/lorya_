export interface User {
  id: string
  createdAt: Date
  updatedAt: Date
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: 'ADMIN' | 'USER' | 'OTHER' // TODO  ADD MISSING ROLES
}
