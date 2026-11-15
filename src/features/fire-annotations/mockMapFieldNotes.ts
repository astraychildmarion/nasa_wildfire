import type { FireFieldNote } from '../../types/annotation'

/** Fictional examples distributed across the contiguous United States for map UI demonstration. */
export const MOCK_MAP_FIELD_NOTES: FireFieldNote[] = [
  {
    id: 'map-note-01', eventDate: '2022-08', lat: 47.423, lng: -120.311,
    locationName: 'Demo site near Wenatchee, Washington', fireType: 'wildfire',
    impacts: ['Smoke impact', 'Contained'],
    notes: 'Fictional report of a wind-driven brush fire on a dry hillside. Local crews contained the fire before it reached nearby homes.',
    reporterRole: 'local_resident', verifiedCount: 8, createdAt: '2022-08-18T16:00:00Z',
  },
  {
    id: 'map-note-02', eventDate: '2021-09-12', lat: 44.052, lng: -121.315,
    locationName: 'Demo site outside Bend, Oregon', fireType: 'prescribed_burn',
    impacts: ['Ecological benefit', 'Contained'],
    notes: 'Fictional report of a planned understory burn completed within marked control lines by a land management crew.',
    reporterRole: 'land_manager_sci', verifiedCount: 12, createdAt: '2021-09-14T10:30:00Z',
  },
  {
    id: 'map-note-03', eventDate: '2023-07', lat: 40.587, lng: -122.392,
    locationName: 'Demo site near Redding, California', fireType: 'wildfire',
    impacts: ['Structures affected', 'Evacuations', 'Smoke impact'],
    notes: 'Fictional witness account of a grass and brush fire that prompted a short precautionary evacuation in the surrounding area.',
    reporterRole: 'first_responder', verifiedCount: 21, createdAt: '2023-07-29T18:45:00Z',
  },
  {
    id: 'map-note-04', eventDate: '2020-07-06', lat: 39.529, lng: -119.814,
    locationName: 'Demo site near Reno, Nevada', fireType: 'agricultural',
    impacts: ['Smoke impact'],
    notes: 'Fictional report of a small permitted land-clearing burn. Smoke was visible from a nearby road and the burn was attended.',
    reporterRole: 'small_landowner', verifiedCount: 5, createdAt: '2020-07-07T09:15:00Z',
  },
  {
    id: 'map-note-05', eventDate: '2024-06-21', lat: 37.276, lng: -107.880,
    locationName: 'Demo site near Durango, Colorado', fireType: 'wildfire',
    impacts: ['High fire risk (potential)', 'Smoke impact'],
    notes: 'Fictional report of a smoldering hot spot after a lightning storm. The area was checked and monitored for possible flare-ups.',
    reporterRole: 'first_responder', verifiedCount: 9, createdAt: '2024-06-22T07:20:00Z',
  },
  {
    id: 'map-note-06', eventDate: '2022-03', lat: 35.222, lng: -101.831,
    locationName: 'Demo site near Amarillo, Texas', fireType: 'agricultural',
    impacts: ['Smoke impact', 'Contained'],
    notes: 'Fictional account of a controlled pasture-edge burn. The landowner reported that the fire remained within a prepared mineral-soil break.',
    reporterRole: 'small_landowner', verifiedCount: 6, createdAt: '2022-03-13T14:00:00Z',
  },
  {
    id: 'map-note-07', eventDate: '2021-05-04', lat: 46.358, lng: -94.200,
    locationName: 'Demo site near Brainerd, Minnesota', fireType: 'false_alarm',
    impacts: ['No ground fire found'],
    notes: 'Fictional follow-up found no ground fire at the reported location. The thermal signal was attributed to a non-fire heat source.',
    reporterRole: 'local_resident', verifiedCount: 4, createdAt: '2021-05-06T11:10:00Z',
  },
  {
    id: 'map-note-08', eventDate: '2023-04-16', lat: 29.187, lng: -82.137,
    locationName: 'Demo site near Ocala, Florida', fireType: 'prescribed_burn',
    impacts: ['Ecological benefit', 'Smoke impact'],
    notes: 'Fictional note describing a scheduled pine-forest burn. Smoke drifted across a nearby trail for part of the afternoon.',
    reporterRole: 'land_manager_sci', verifiedCount: 14, createdAt: '2023-04-17T08:30:00Z',
  },
  {
    id: 'map-note-09', eventDate: '2020-11', lat: 35.595, lng: -82.551,
    locationName: 'Demo site near Asheville, North Carolina', fireType: 'wildfire',
    impacts: ['High fire risk (potential)', 'Evacuations'],
    notes: 'Fictional report of dry leaves and embers near a wooded slope. Residents requested a precautionary check during a period of elevated fire danger.',
    reporterRole: 'local_resident', verifiedCount: 10, createdAt: '2020-11-09T17:35:00Z',
  },
  {
    id: 'map-note-10', eventDate: '2024-09-03', lat: 44.801, lng: -68.778,
    locationName: 'Demo site near Bangor, Maine', fireType: 'agricultural',
    impacts: ['Contained'],
    notes: 'Fictional land manager note about a small debris burn that was attended and fully extinguished before nightfall.',
    reporterRole: 'land_manager_sci', verifiedCount: 3, createdAt: '2024-09-05T13:05:00Z',
  },
]
