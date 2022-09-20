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

# Requirements checklist

### Обязательные требования

- [x] Пароли не хранить в открытом виде
- [x] Реализовать валидацию полей на api запросы с кодами ответов и сообщениями об ошибке в теле ответа.
- [x] Развернуть проект в любом удобном месте, что бы можно было прогнать тесты и проверить.
- [x] Код на github или gitlab
- [x] Придерживаться принципам SOLID
- [x] Токен авторизации живет 30 минут
- [x] Реализовать endpoint для обновления токена
- [x] Создать миграции
- [x] Написать сопроводительную документация в README.md для разворота
- [x] Реализовать offset или пагинацию для сущности **TAG**
- [x] Реализовать Сортировку по полю **sortOrder** и(или) полю **name** для сущности **TAG**

### Дополнительные требования

- [x] Использовать DTO
- [ ] Писать интерфейсы и реализовывать их `странное требование, не понятно что за интерфейсы и зачем`
- [ ] Желательно не использовать ORM `хотелось попробовать призму, но могу зарефакторить под plain sql`
- [x] Написать DockerFile для приложения
- [x] Написать docker-composer для локального разворота приложения
- [ ] Реализовать кеширование
- [x] Покрыть тестами сами api
- [x] Добавить генерацию swagger документации для api методов (или написать ручками и положит в проект в директорию /doc)

# dev notes

я уже писал как-то раз эти дев нотес, но в итоге тестовое задание тупо не посмотрели. боюсь большинство стараний уйдут насмарку. нестжс похож на спринг в мире жвм и это прикольно, но все еще чувствуется привкус жаваскрипта и это неприкольно. в целом классно что я изучил эту технологию и сделал это тестовое. мне понравилось.
