require('dotenv').config({ path: __dirname + '/../.env' });

module.exports = {
  googleClientID:
    '964808011168-29vqsooppd769hk90kjbjm5gld0glssb.apps.googleusercontent.com',
  googleClientSecret: 'KnH-rZC23z4fr2CN4ISK4srN',
  mongoURI: process.env['MONGO_DB_URL'],
  cookieKey: '123123123'
};
