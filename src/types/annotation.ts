export type FireEventType =
  | 'wildfire'
  | 'prescribed_burn'
  | 'agricultural'
  | 'false_alarm'

export type ReporterRole =
  | 'local_resident'
  | 'small_landowner'
  | 'first_responder'
  | 'land_manager_sci'

export interface FireFieldNote {
  id: string
  eventDate: string
  lat: number
  lng: number
  locationName?: string
  fireType: FireEventType
  impacts: string[]
  notes: string
  reporterRole: ReporterRole
  evidenceUrl?: string
  verifiedCount: number
  isVerifiedByCurrentUser?: boolean
  createdAt: string
}

export type NewFireFieldNote = Omit<
  FireFieldNote,
  'id' | 'verifiedCount' | 'isVerifiedByCurrentUser' | 'createdAt'
>
