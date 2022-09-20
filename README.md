# Run in docker

```shell
$ docker compose --profile prod up -d
```

Open `http://localhost:3000/swagger` to verify it's working

# Run tests

```shell
$ yarn install --ignore-engines
$ yarn run test
```

To inspect tests

```shell
$ cat test/app.integration-spec.ts
```
