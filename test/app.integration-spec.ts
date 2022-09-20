import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { Page } from '../src/pagination';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Integration tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  const users = {
    a: {
      nickname: 'exampleNickname',
      email: 'example@email.com',
      password: '123',
    },
    b: {
      nickname: 'secondUser',
      email: 'secondUser@email.com',
      password: 'differentpassword',
    },
    c: {
      nickname: 'im tired defining users',
      email: 'aniother@example.alskdfjaklsjdflk',
      password: 'asldfjal;sjkd',
    },
  };
  const authorizationHeaders = {
    a: { Authorization: 'Bearer $S{accessToken}' },
    b: { Authorization: 'Bearer $S{accessToken2}' },
  };

  describe('Security test', () => {
    describe('Signup', () => {
      it('EMAIL EMPTY REGISTER should throw', async () => {
        await pactum
          .spec()
          .post('/signup')
          .withBody({
            password: users.a.password,
          })
          .expectStatus(400);
      });
      it('REGISTER +check_schema should succeed', async () => {
        await pactum
          .spec()
          .post('/signup')
          .withBody(users.a)
          .expectStatus(201)
          .expectJsonLike({
            accessToken: /.*/,
            expiresIn: /.*/,
            refreshToken: /.*/,
          });
      });
      it('REGISTER USER_B should succeed', async () => {
        await pactum.spec().post('/signup').withBody(users.b).expectStatus(201);
      });
      it('REGISTER USER_B 2 should throw', async () => {
        await pactum.spec().post('/signup').withBody(users.b).expectStatus(403);
      });
    });

    describe('login', () => {
      it('NO NICKNAME NO EMAIL should throw', async () => {
        await pactum
          .spec()
          .post('/login')
          .withBody({ password: users.a.password })
          .expectStatus(400);
      });
      it('NO PASS should throw', async () => {
        await pactum
          .spec()
          .post('/login')
          .withBody({ email: users.a.email })
          .expectStatus(400);
      });
      it('NICKNAME USER_A +check_schema should succeed', async () => {
        await pactum
          .spec()
          .post('/login')
          .withBody({
            nickname: users.a.nickname,
            password: users.a.password,
          })
          .expectStatus(200)
          .expectJsonLike({
            accessToken: /.*/,
            expiresIn: /.*/,
            refreshToken: /.*/,
          })
          .stores('accessToken', 'accessToken');
      });
      it('EMAIL USER_B should succeed', async () => {
        await pactum
          .spec()
          .post('/login')
          .withBody({
            email: users.b.email,
            password: users.b.password,
          })
          .expectStatus(200)
          .stores('accessToken2', 'accessToken');
      });
    });
  });

  describe('User Api', () => {
    describe('GET SELF', () => {
      it('should succeed', async () => {
        await pactum
          .spec()
          .get('/user')
          .withHeaders(authorizationHeaders.a)
          .expectStatus(200)
          .expectJsonLike({
            email: users.a.email,
            nickname: users.a.nickname,
          });
      });
      it('NO AUTH HEADER should fail', async () => {
        await pactum.spec().get('/user').expectStatus(401);
      });
    });

    it('EDIT SELF AND GET should succeed and update', async () => {
      // edit
      await pactum
        .spec()
        .put('/user')
        .withHeaders(authorizationHeaders.a)
        .withBody(users.c)
        .expectStatus(200)
        .expectJsonLike({
          email: users.c.email,
          nickname: users.c.nickname,
        });
      // validate changed
      await pactum
        .spec()
        .get('/user')
        .withHeaders(authorizationHeaders.a)
        .expectStatus(200)
        .expectJsonLike({
          email: users.c.email,
          nickname: users.c.nickname,
        });
      // rollback
      await pactum
        .spec()
        .put('/user')
        .withHeaders(authorizationHeaders.a)
        .withBody(users.a);
    });

    it('DELETE SELF AND GET should succeed and delete', async () => {
      // delete
      await pactum
        .spec()
        .delete('/user')
        .withHeaders(authorizationHeaders.b)
        .expectStatus(204);
      // validate changed
      await pactum
        .spec()
        .get('/user')
        .withHeaders(authorizationHeaders.b)
        .expectStatus(401);
      // rollback
      await pactum
        .spec()
        .post('/signup')
        .withBody(users.b)
        .expectStatus(201)
        .stores('accessToken2', 'accessToken');
    });
  });

  describe('Tag Api', () => {
    const tags = {
      a: { name: 'tag A', sortOrder: 1 },
      b: { name: 'tag B' },
      c: { name: 'tag C', sortOrder: 1000 },
    };

    it('GET should return empty', async () => {
      await pactum
        .spec()
        .get('/tags')
        .withHeaders(authorizationHeaders.a)
        .expectStatus(200)
        .expectBody({ ...new Page() });
    });

    describe('POST', () => {
      it('should create new', async () => {
        await pactum
          .spec()
          .post('/tags')
          .withHeaders(authorizationHeaders.a)
          .withBody(tags.a)
          .expectStatus(201)
          .expectJsonLike(tags.a)
          .stores('tagIdA', 'id');
      });

      it('should create new', async () => {
        await pactum
          .spec()
          .post('/tags')
          .withHeaders(authorizationHeaders.a)
          .withBody(tags.b)
          .expectStatus(201)
          .expectJsonLike(tags.b)
          .stores('tagIdB', 'id');
      });

      it('MULTIPLE should create two and return', async () => {
        await pactum
          .spec()
          .post('/tags/multiple')
          .withHeaders(authorizationHeaders.a)
          .withBody([tags.c, tags.c])
          .expectStatus(201)
          .expectJsonLike([tags.c, tags.c]);
      });
    });

    describe('GET', () => {
      describe('PAGINATED', () => {
        it('sort check should return tag A', async () => {
          await pactum
            .spec()
            .get('/tags')
            .withQueryParams('offset', 0)
            .withQueryParams('length', 1)
            .withQueryParams('sortBy', 'name')
            .withHeaders(authorizationHeaders.a)
            .expectStatus(200)
            .expectJsonLike({
              data: [
                {
                  ...tags.a,
                  id: /\d+/,
                  creator: {
                    nickname: users.a.nickname,
                    email: users.a.email,
                  },
                },
              ],
              meta: { offset: 0, length: 1, quantity: 1 },
            });
        });

        it('sort check should return tag B, tag A', async () => {
          await pactum
            .spec()
            .get('/tags')
            .withQueryParams('offset', 0)
            .withQueryParams('length', 1)
            .withQueryParams('sortBy', 'sortOrder')
            .withHeaders(authorizationHeaders.a)
            .expectStatus(200)
            .expectJsonLike({ data: [tags.b] });
        });

        it('should return 4 tags', async () => {
          await pactum
            .spec()
            .get('/tags')
            .withHeaders(authorizationHeaders.a)
            .expectStatus(200)
            .expectJsonLike({ data: [tags.a, tags.b, tags.c, tags.c] });
        });
      });

      describe('ID', () => {
        it('should succeed', async () => {
          await pactum
            .spec()
            .get('/tags/{id}')
            .withPathParams('id', '$S{tagIdA}')
            .withHeaders(authorizationHeaders.a)
            .expectStatus(200)
            .expectJsonLike({
              ...tags.a,
              creator: { email: users.a.email },
            });
        });

        it('GET NON EXISTENT should fail', async () => {
          await pactum
            .spec()
            .get('/tags/5879273593')
            .withHeaders(authorizationHeaders.a)
            .expectStatus(404);
        });
      });
    });

    describe('EDIT', () => {
      it('PUT AND GET should succeed and update', async () => {
        // edit
        await pactum
          .spec()
          .put('/tags/{id}')
          .withPathParams('id', '$S{tagIdA}')
          .withHeaders(authorizationHeaders.a)
          .withBody(tags.c)
          .expectStatus(200)
          .expectJsonLike(tags.c);
        // check update
        await pactum
          .spec()
          .get('/tags/{id}')
          .withPathParams('id', '$S{tagIdA}')
          .withHeaders(authorizationHeaders.a)
          .expectStatus(200)
          .expectJsonLike({
            ...tags.c,
            creator: { nickname: users.a.nickname },
          });
      });

      it('PUT WITH DIFFERENT USER should fail', async () => {
        await pactum
          .spec()
          .put('/tags/{id}')
          .withPathParams('id', '$S{tagIdA}')
          .withHeaders(authorizationHeaders.b)
          .withBody(tags.a)
          .expectStatus(403);
      });
    });

    describe('Delete tags', () => {
      it('DELETE should succeed', async () => {
        await pactum
          .spec()
          .delete('/tags/{id}')
          .withPathParams('id', '$S{tagIdA}')
          .withHeaders(authorizationHeaders.a)
          .inspect()
          .expectStatus(204);
        await pactum
          .spec()
          .get('/tags/{id}')
          .withPathParams('id', '$S{tagIdA}')
          .withHeaders(authorizationHeaders.a)
          .inspect()
          .expectStatus(404);
      });

      it('DELETE WITH DIFFERENT USER should fail', async () => {
        await pactum
          .spec()
          .delete('/tags/{id}')
          .withPathParams('id', '$S{tagIdB}')
          .withHeaders(authorizationHeaders.b)
          .expectStatus(403);
      });
    });
  });
});
