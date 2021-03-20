const { firestore } = require('firebase-admin');

module.exports = {
  regions: {
    jerusalem: {
      counter: 392,
    },
  },
  totalCounter: 3029,
  locations: {
    balfur: {
      id: 'balfur',
      name: 'כיכר פריז',
      city: 'ירושלים',
      counter: 1213,
      latitude: 32.2951163,
      longitude: 35.6676373,
      recentPictures: [
        {
          archived: false,
          authorId: 'd8GSM5GdfuW0KDlH7dy8oqd5ngz1',
          id: 'K0HjtO1bOAGg24ZrrGcN',
          likeCounter: 0,
          locationName: 'כיכר פריז',
          pictureHeight: 1440,
          pictureUrl:
            'https://media.reshet.tv/image/upload/t_main_image_article,f_auto,q_auto/v1596087348/protst1_j79xag.png',
          pictureWidth: 1920,
          text: '',
          type: 'picture',
          coordinates: new firestore.GeoPoint(31.775077, 35.217622),
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        {
          archived: false,
          authorId: 'd8GSM5GdfuW0KDlH7dy8oqd5ngz1',
          id: 'K0HjtO1bOAGg24ZrrGcN',
          likeCounter: 0,
          locationName: 'כיכר פריז',
          pictureHeight: 1440,
          pictureUrl:
            'https://media.reshet.tv/image/upload/t_main_image_article,f_auto,q_auto/v1596087348/protst1_j79xag.png',
          pictureWidth: 1920,
          text: '',
          type: 'picture',
          coordinates: new firestore.GeoPoint(31.775077, 35.217622),
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
      ],
    },
    'rabin-square': {
      id: 'rabin-square',
      name: 'כיכר רבין',
      city: 'תל אביב',
      counter: 689,
      latitude: 32.080485,
      longitude: 34.78062,
    },
    'habima-square': {
      id: 'habima-square',
      name: 'כיכר הבימה',
      city: 'תל אביב',
      counter: 132,
      latitude: 32.072387,
      longitude: 34.7817674,
    },
    'kakal-intersection-tlv': {
      id: 'kakal-intersection-tlv',
      name: 'מחלף קק"ל',
      city: 'תל אביב',
      counter: 27,
      latitude: 32.11904,
      longitude: 34.81236,
    },
    'pardesiya-junction': {
      id: 'pardesiya-junction',
      name: 'צומת פרדסיה',
      city: 'פרדסיה',
      counter: 16,
      latitude: 32.3046,
      longitude: 34.90078,
    },
    'chemed-intersection': {
      id: 'chemed-intersection',
      name: 'מחלף חמד',
      city: 'ירושלים',
      counter: 39,
      latitude: 31.80008,
      longitude: 35.12347,
    },
  },
};
