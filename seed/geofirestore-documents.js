const { firestore } = require('firebase-admin');

const now = new Date();
const in5Hours = new Date();
in5Hours.setHours(now.getHours() + 5);

module.exports = {
  regions: [
    {
      id: 'jerusalem',
      name: 'ירושלים',
      coordinates: new firestore.GeoPoint(31.774979, 35.217181),
    },
  ],
  events: [
    {
      id: 'tlv-street-march',
      title: 'תל אביב יוצאת לרחוב',
      compactThumbnail: 'https://res.cloudinary.com/onekm/image/upload/v1612866689/event_thumbs/eventhumb1_nus985.png',
      thumbnail:
        'https://scontent.ftlv5-1.fna.fbcdn.net/v/t1.0-9/147753239_208741727662658_6215603639489934569_o.jpg?_nc_cat=109&ccb=3&_nc_sid=340051&_nc_ohc=tQGHDwEHzC0AX9ZBCRY&_nc_ht=scontent.ftlv5-1.fna&oh=942097c4644bb1303f7fda3f3da27cf9&oe=604B89AB',
      startDate: firestore.Timestamp.fromDate(now),
      endDate: firestore.Timestamp.fromDate(in5Hours),
      locationId: 'habima-square',
      locationName: 'כיכר הבימה',
      city: 'תל אביב - יפו',
      province: 'תל אביב',
      coordinates: new firestore.GeoPoint(32.072384, 34.779377),
      attendingCount: 0,
      content:
        '<p>הפלנו את הממשלה</p><p>אבל זאת רק ההתחלה</p><p></p><p>כהרגלנו, ביום חמישי, בהבימה ב20:00</p><p>תל אביב ממשיכה לצעוד בזעם ובתקווה</p><p>מחליפות עולם ישן בחדש</p><p>ממשיכים למוטט את מגדל הקלפים של הנאשם בפלילים</p><p>לא עושים עלינו רושם תרגילים פוליטיים מלוכלכים</p><p>לא מפחדות מהאלימות המשטרתית</p><p>בעיצומו של סגר פוליטי שלישי</p><p>אחרי שאפילו בסביבתו הקרובה של נתניהו כבר מודים שטובת הציבור לא מעניינת אותו,</p><p>דורשות ממקבלי החלטות לחסן גם</p><p>את האזרחים מפני העוני</p><p>את העסקים מקריסה</p><p>ואת המדינה מפני השחיתות</p><p>עד אז נמשיך להפגין בכל מקום.</p>',
      organizers: [
        {
          profilePicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
          name: 'קומי ישראל',
          id: 'kumi',
        },
      ],
      status: 'upcoming',
    },
    {
      id: 'stop-the-transfer',
      title: 'עוצרים את הגירוש',
      thumbnail:
        'https://scontent.ftlv5-1.fna.fbcdn.net/v/t1.0-9/142479377_4184100031601382_8867343736105820135_n.jpg?_nc_cat=108&ccb=3&_nc_sid=e3f864&_nc_ohc=MyR4iQFBHeUAX_IAsle&_nc_ht=scontent.ftlv5-1.fna&oh=656ff75a4c639be693eb5688349067e0&oe=604B841C',
      compactThumbnail:
        'https://res.cloudinary.com/onekm/image/upload/v1612871850/event_thumbs/Artboard_Copy_z8bgvh.png',
      startDate: firestore.Timestamp.fromDate(now),
      endDate: firestore.Timestamp.fromDate(in5Hours),
      locationId: 'balfur',
      locationName: 'בלפור',
      city: 'ירושלים',
      province: 'ירושלים',
      coordinates: new firestore.GeoPoint(31.775077, 35.217622),
      attendingCount: 0,
      content:
        '<p>הפלנו את הממשלה</p><p>אבל זאת רק ההתחלה</p><p></p><p>כהרגלנו, ביום חמישי, בהבימה ב20:00</p><p>תל אביב ממשיכה לצעוד בזעם ובתקווה</p><p>מחליפות עולם ישן בחדש</p><p>ממשיכים למוטט את מגדל הקלפים של הנאשם בפלילים</p><p>לא עושים עלינו רושם תרגילים פוליטיים מלוכלכים</p><p>לא מפחדות מהאלימות המשטרתית</p><p>בעיצומו של סגר פוליטי שלישי</p><p>אחרי שאפילו בסביבתו הקרובה של נתניהו כבר מודים שטובת הציבור לא מעניינת אותו,</p><p>דורשות ממקבלי החלטות לחסן גם</p><p>את האזרחים מפני העוני</p><p>את העסקים מקריסה</p><p>ואת המדינה מפני השחיתות</p><p>עד אז נמשיך להפגין בכל מקום.</p>',
      organizers: [
        {
          profilePicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
          name: 'קומי ישראל',
          id: 'kumi',
        },
      ],
      status: 'upcoming',
      createdAt: firestore.FieldValue.serverTimestamp(),
    },
  ],
  posts: [
    {
      archived: false,
      authorId: 'd8GSM5GdfuW0KDlH7dy8oqd5ngz1',
      authorName: 'Guy',
      authorPicture:
        'https://firebasestorage.googleapis.com/v0/b/act1-dev.appspot.com/o/profilePictures%2Fd8GSM5GdfuW0KDlH7dy8oqd5ngz1%2FaVQWeyiBDi.jpg?alt=media&token=b4350a20-1abd-4cb0-a303-8595775b794c',
      blurhash: 'LXFXeO%0NHjb~9%1RkRkxtxZWBRk',
      featured: true,
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
};
