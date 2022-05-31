import { queryBuilder, paginateBuilder } from '~/routes/utils';

describe('Test queryBuilder Method', () => {
  it('Should return an Valid Object in Happy case', () => {
    const param = { name: { regex: 's' } };
    const res = queryBuilder(param);

    expect(res).toMatchObject({ name: { $regex: 's' } });
  });

  it('Should return an Valid Object in case wrong input', () => {
    const param = { name: { regex: 's' }, description: { wrong: 's' } };
    const res = queryBuilder(param);

    expect(res).toMatchObject({
      name: {
        $regex: 's',
      },
    });
  });
});

describe('Test paginateBuilder Method', () => {
  it('Should return an Valid Object in Happy case', () => {
    const param = {
      pageSize: 5,
      page: 2,
      sort: ['name', '-description'],
    };
    const res = paginateBuilder(param);

    expect(res).toMatchObject({
      limit: 5,
      skip: 5,
      sort: 'name -description',
    });
  });
});
