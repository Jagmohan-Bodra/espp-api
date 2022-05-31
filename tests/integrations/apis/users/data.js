export const fakeUserGroup = {
  name: 'admin',
  roles: ['/v1/users/get-list', '/v1/users/{id}/get'],
};

export const fakeUsers = [
  {
    name: 'user01',
    email: 'user01@mail.com',
    phone: '0123456782',
    password: 'encrypted-password',
    validTokens: ['token01', 'token02'],
  },
  {
    name: 'user02',
    email: 'user02@mail.com',
    phone: '0123456780',
    password: 'encrypted-password',
    validTokens: ['token03', 'token04'],
  },
  {
    name: 'user03',
    email: 'user03@mail.com',
    phone: '0123456781',
    password: 'encrypted-password',
    validTokens: [],
  },
  {
    name: 'user04',
    email: 'USERUPPERCASE@mail.com',
    phone: '0123456789',
    password: 'encrypted-password',
    validTokens: ['token01', 'token02'],
  },
];
