const { firestore } = require('firebase-admin');

const now = new Date();
const before1Hour = new Date();
before1Hour.setHours(now.getHours() + 5);

module.exports = {
  'organizations/kumiiisrael': {
    id: 'kumi',
    name: 'קומי ישראל',
    profilePicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
  },
  'organizations/crime-minister': {
    id: 'crime-minister',
    name: 'Crime Minister',
    profilePicture:
      'https://res.cloudinary.com/onekm/image/upload/c_scale,w_300/v1608279410/organizers/crime-minister_alpxwz.png',
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
  'posts/first-post': {
    authorId: 'kumiiisrael',
    authorName: 'קומי ישראל',
    authorPicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
    authorType: 'organization',
    content:
      '<p>המאבק הנחוש ברחובות הביא להפלת הממשלה הנוראית והכושלת ביותר מקום המדינה, אך זהו רק צעד ראשון בדרך לשינוי אמיתי ועמוק בחברה ובהנהגה הישראלית. רק המחאה תכריע. 19:00 גשר המיתרים. 20:00 בלפור.</p>',
    likeCounter: 0,
    timestamp: firestore.Timestamp.fromDate(now),
  },
  'posts/another-post': {
    authorId: 'crime-minister',
    authorName: 'Crime Minister',
    authorPicture:
      'https://res.cloudinary.com/onekm/image/upload/c_scale,w_300/v1608279410/organizers/crime-minister_alpxwz.png',
    authorType: 'organization',
    content: '<p>מוצש. בלפור. 19:30. בנוהל!</p>',
    likeCounter: 0,
    timestamp: firestore.Timestamp.fromDate(before1Hour),
  },
  'posts/another-post-2': {
    authorId: 'crime-minister',
    authorName: 'Crime Minister',
    authorPicture:
      'https://res.cloudinary.com/onekm/image/upload/c_scale,w_300/v1608279410/organizers/crime-minister_alpxwz.png',
    authorType: 'organization',
    content: '<p>מוצש. בלפור. 19:30. בנוהל!</p>',
    likeCounter: 0,
    timestamp: firestore.Timestamp.fromDate(before1Hour),
  },
  'posts/another-post-3': {
    authorId: 'crime-minister',
    authorName: 'Crime Minister',
    authorPicture:
      'https://res.cloudinary.com/onekm/image/upload/c_scale,w_300/v1608279410/organizers/crime-minister_alpxwz.png',
    authorType: 'organization',
    content: '<p>מוצש. בלפור. 19:30. בנוהל!</p>',
    likeCounter: 0,
    timestamp: firestore.Timestamp.fromDate(before1Hour),
  },
  'posts/another-post-4': {
    authorId: 'crime-minister',
    authorName: 'Crime Minister',
    authorPicture:
      'https://res.cloudinary.com/onekm/image/upload/c_scale,w_300/v1608279410/organizers/crime-minister_alpxwz.png',
    authorType: 'organization',
    content: '<p>מוצש. בלפור. 19:30. בנוהל!</p>',
    likeCounter: 0,
    timestamp: firestore.Timestamp.fromDate(before1Hour),
  },
  'posts/first-post-2': {
    authorId: 'kumiiisrael',
    authorName: 'קומי ישראל',
    authorPicture: 'https://res.cloudinary.com/onekm/image/upload/v1609308381/organizers/kumi_ze0p8z.jpg',
    authorType: 'organization',
    content:
      '<p>המאבק הנחוש ברחובות הביא להפלת הממשלה הנוראית והכושלת ביותר מקום המדינה, אך זהו רק צעד ראשון בדרך לשינוי אמיתי ועמוק בחברה ובהנהגה הישראלית. רק המחאה תכריע. 19:00 גשר המיתרים. 20:00 בלפור.</p>',
    likeCounter: 0,
    timestamp: firestore.Timestamp.fromDate(now),
  },
};
