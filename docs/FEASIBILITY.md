# Реализуемость · 18.10.2026

## Spotify

Новые приложения документированы. Development mode: Premium владельца, до 5 allowlisted пользователей; июльский changelog 2026 увеличил лимит Client IDs до 25, поэтому старое февральское ограничение в 1 app уже устарело. Реальная доступность регистрации именно у пользователя требует входа в Dashboard.

- [Apps](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- [July 2026 changes](https://developer.spotify.com/documentation/web-api/references/changes/july-2026)
- [Redirect URI: loopback literal, не localhost](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)

[Top Items](https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks): affinity топ треков/исполнителей, не альбомов; окна около 4 недель / 6 месяцев / 1 года. Нет дат каждого play, play counts или фактически прослушанных минут. Полную годовую историю сразу получить нельзя. long_term — приблизительный affinity по ~году, не точный календарный год. Для прототипа фиксированная выборка первых 50, без обещания полной выборки.

[Recently Played](https://developer.spotify.com/documentation/web-api/reference/get-recently-played): timestamp played_at и metadata трека/альбома, максимум 50 на страницу, before/after cursors. Нет фактического времени прослушивания. Наличие курсора не доказывает доступность 12 месяцев. Прототип делает только диагностический запрос; не выдаёт эту историю за годовой рейтинг.

[Extended history](https://support.spotify.com/us/article/understanding-your-data/): экспорт содержит временные отметки, ms played, URI трека и текстовые metadata альбома/исполнителя. Нужно запросить выгрузку и дождаться архива; это не мгновенное подключение. Данные загружаются пользователем локально. Обложек и album ID в этих полях нет.

Публичный запуск существенно ограничен: [Developer Policy II.13](https://developer.spotify.com/policy) запрещает производные listenership metrics. Алгоритм агрегации в прототипе не следует считать согласованным Spotify, локальность сама по себе не снимает ограничение. Нужно получить разъяснение/разрешение до использования Spotify Platform для такого продукта. Extended quota requests по официальной странице принимаются от организаций, с работающим сервисом и не менее 250k MAU, с review и соблюдением Terms. Не обещаем публичное подключение каждому пользователю. Отдельно проверить право на скачиваемые коллажи: metadata/artwork требуют атрибуции и обратной ссылки на Spotify.

## Deezer

Официальные страницы `developers.deezer.com/myapps`, `/api/user/history`, `/api/user/charts` не удалось прочитать в ходе проверки. Поэтому OAuth, текущие scopes, лимиты/даты/history pagination, play counts/длительности и доступность года **не подтверждены**. Старые descriptions сторонних библиотек не приняты за текущий контракт.

[Официальное сообщество: App Registration, май 2026](https://en.deezercommunity.com/features-feedback-44/app-registration-82666) сообщает об отсутствии информации о возобновлении регистрации; ответ Superuser — не официальный API SLA. [Ответы сотрудников Deezer об отключённых app IDs](https://en.deezercommunity.com/your-account-favorites-and-playlists-70/oauth-exception-81676) подтверждают отдельную проверку существующих приложений и возможность их деактивации. Это не доказывает доступность новой регистрации сегодня.

Итог: интеграция заблокирована отсутствием подтверждённого developer access. Пользователь может проверить My Apps в своём аккаунте; если есть действующий app ID, следующий шаг — получить актуальную документацию и проверить разрешённые endpoints. Не подменять API cookies/ARL или скрейпингом. Годовая история и публичный запуск не обещаются.

## YouTube / YouTube Music

[YouTube Data API revision history](https://developers.google.com/youtube/data/revision_history) прямо указывает недоступность watch history/watch later даже авторизованному пользователю. OAuth проект создать можно, но он не добавляет нужные данные. Плейлисты, likes, metadata видео — не история пользователя, а duration видео не фактически просмотренное время. Отдельный официальный YouTube Music listening statistics API не подтверждён.

[Google Takeout](https://support.google.com/accounts/answer/3024190): пользователь экспортирует YouTube and YouTube Music → history, формат JSON, затем распаковывает ZIP и выбирает watch-history.json. Доступная глубина зависит от сохранённой истории, удаления и auto-delete. Файл может охватывать год, но это не гарантия полноты. JSON часто содержит video URL и time, без надёжного соответствия album ID; прототип считает только аудит событий, не выдумывает альбомы.

Есть также [официальный Data Portability API](https://developers.google.com/data-portability/user-guide/introduction), включая `dataportability.myactivity.youtube`: OAuth → archive job → ожидание → signed download. Это отдельный официальный экспорт, не быстрый топ API. [Условия](https://developers.google.com/data-portability/user-guide/overview): поддерживаемая страна/регион и 18+, billing, OAuth и верификация перед публикацией (возможна security assessment). География аккаунта пользователя неизвестна; часовой пояс не доказывает eligibility. Не реализован в этой версии из-за неподтверждённой eligibility/конфигурации и отсутствия решения album mapping. В будущем возможен как отдельная авторизованная доставка того же экспорта.

## Статус проверки

Код сборки и тестовые расчёты проверены. Никаких запросов к приватным аккаунтам без OAuth не было. Пока нет Client ID / consent и реальных архивов, все account-level интеграции считаются непроверенными. Диагностическая кнопка Spotify выполняет реальные запросы после подключения; только её успешный ответ вместе с реальными результатами закроет эту часть проверки.
