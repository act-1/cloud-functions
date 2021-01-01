const { firestore } = require('firebase-admin');

module.exports = {
  'organizations/kumiiisrael': {
    id: 'kumi',
    name: 'קומי ישראל',
    profilePicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
  },
  'events/no-seger-politi': {
    title: 'לא נסכים לסגר פוליטי',
    locationName: 'כיכר הבימה, תל אביב',
    thumbnail:
      'https://scontent-arn2-2.xx.fbcdn.net/v/t1.0-9/133797631_181481130388718_4878572341523429435_n.jpg?_nc_cat=105&ccb=2&_nc_sid=340051&_nc_ohc=P2Dtw4Px4CUAX8ZOKyw&_nc_ht=scontent-arn2-2.xx&oh=c5c30a4f51cfa6c10e78a281b94a9213&oe=6014E9B6',
    startDate: new firestore.Timestamp(1609446600, 348000000),
    endDate: new firestore.Timestamp(1609446600, 348000000),
    content:
      '<p>הפלנו את הממשלה</p><p>אבל זאת רק ההתחלה</p><p></p><p>כהרגלנו, ביום חמישי, בהבימה ב20:00</p><p>תל אביב ממשיכה לצעוד בזעם ובתקווה</p><p>מחליפות עולם ישן בחדש</p><p>ממשיכים למוטט את מגדל הקלפים של הנאשם בפלילים</p><p>לא עושים עלינו רושם תרגילים פוליטיים מלוכלכים</p><p>לא מפחדות מהאלימות המשטרתית</p><p>בעיצומו של סגר פוליטי שלישי</p><p>אחרי שאפילו בסביבתו הקרובה של נתניהו כבר מודים שטובת הציבור לא מעניינת אותו,</p><p>דורשות ממקבלי החלטות לחסן גם</p><p>את האזרחים מפני העוני</p><p>את העסקים מקריסה</p><p>ואת המדינה מפני השחיתות</p><p>עד אז נמשיך להפגין בכל מקום.</p>',
    organizers: [
      {
        profilePicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
        name: 'קומי ישראל',
        id: 'kumi',
      },
    ],
  },
};
