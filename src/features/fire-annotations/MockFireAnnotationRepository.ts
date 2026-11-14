import type { FireFieldNote, NewFireFieldNote } from '../../types/annotation'

const initialNotes: FireFieldNote[] = [
  {
    id: 'note-2023-08-wildfire', eventDate: '2023-08', lat: 38.548, lng: -120.742,
    locationName: 'Cedar Ridge, western slope', fireType: 'wildfire', impacts: ['Smoke impact', 'Evacuations', 'Contained'],
    notes: 'Residents reported a fast-moving vegetation fire after a dry lightning storm. Fire crews established a line along the ridge; nearby homes were evacuated overnight.',
    reporterRole: 'first_responder', evidenceUrl: 'https://inciweb.wildfire.gov/', verifiedCount: 18, isVerifiedByCurrentUser: false, createdAt: '2023-09-04T16:20:00Z',
  },
  {
    id: 'note-2022-10-prescribed', eventDate: '2022-10-14', lat: 37.214, lng: -119.623,
    locationName: 'South Fork forest management unit', fireType: 'prescribed_burn', impacts: ['Ecological benefit', 'Contained'],
    notes: 'A permitted understory burn was conducted by the forest crew within prepared control lines. Smoke was visible from the valley during the afternoon.',
    reporterRole: 'land_manager_sci', verifiedCount: 11, isVerifiedByCurrentUser: true, createdAt: '2022-10-19T09:00:00Z',
  },
  {
    id: 'note-2021-07-false-alarm', eventDate: '2021-07', lat: 36.821, lng: -121.425,
    locationName: 'Industrial parcel near the river', fireType: 'false_alarm', impacts: ['No ground fire found'],
    notes: 'A site inspection found no vegetation fire. The thermal signature appears consistent with routine industrial activity at the processing facility.',
    reporterRole: 'small_landowner', verifiedCount: 7, isVerifiedByCurrentUser: false, createdAt: '2021-07-22T13:40:00Z',
  },
]

const delay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 180))

export class MockFireAnnotationRepository {
  private notes = initialNotes.map((note) => ({ ...note, impacts: [...note.impacts] }))

  async list(): Promise<FireFieldNote[]> {
    await delay()
    return this.notes.map((note) => ({ ...note, impacts: [...note.impacts] }))
  }

  async add(input: NewFireFieldNote): Promise<FireFieldNote> {
    await delay()
    const note: FireFieldNote = {
      ...input,
      id: `note-${crypto.randomUUID()}`,
      verifiedCount: 0,
      isVerifiedByCurrentUser: false,
      createdAt: new Date().toISOString(),
    }
    this.notes = [note, ...this.notes]
    return { ...note, impacts: [...note.impacts] }
  }

  async toggleVerified(id: string): Promise<FireFieldNote> {
    await delay()
    const note = this.notes.find((item) => item.id === id)
    if (!note) throw new Error('Field note not found')
    note.isVerifiedByCurrentUser = !note.isVerifiedByCurrentUser
    note.verifiedCount += note.isVerifiedByCurrentUser ? 1 : -1
    return { ...note, impacts: [...note.impacts] }
  }
}
