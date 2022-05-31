import _ from 'lodash';
import ROLES from '~/routes/constants/roles';

const dataMock = {
  user: {
    name: 'Mr. Admin',
    phone: '0923456789',
    email: 'admin@email.com',
    password: 'md5-hash-pass',
    validTokens: ['abcde', '123456'],
  },
  userGroup: {
    name: 'Zadmin',
    roles: Object.values(ROLES),
  },
};
export const getToken = async (server, db, data = dataMock) => {
  const userGroup = await db
    .collection('user_groups')
    .insertOne(data.userGroup);
  data.user.userGroup = userGroup.insertedId;
  await db.collection('users').insertOne(data.user);

  const resData = await server
    .post('/v1/auth/sign-in')
    .send(_.pick(data.user, ['email', 'password']));
  const { token } = resData.body.data;

  return token;
};
