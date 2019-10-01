# webpgfn, web-api with pg functions

what if web-api in "awesome" pg' .sql(s)?

pg has jsonb.
webpgfn is an express-based web-api,
it routes /schema.function to pg-query select schema.function(body/query)
that returns a jsonb.
for example: `http://localhost:3000/foo.bar?a=1`, queries `select foo.bar('{"a":1}'::jsonb)` and returns jsonb response.


pg lacks async.
to compose response from other services (pg-functions, etc);
webpgfn checks a tagged exception, `callback: [{job},..]`.
for example, foo.bar raises an exception to call foo.baz next
```
b = jsonb_build_array(json_build_object(
    'url', 'pg://foo.baz',
    'ctx', x || jsonb_build_object('bar', a + 100)));
raise exception 'callback: %', b::text;
```

## install

setup pg
```
set PGPASSWORD=rei
docker run --rm -d -p 5432:5432 -v %cd%:/work --name pg1 -e POSTGRES_PASSWORD=%PGPASSWORD% postgres
docker exec -it pg1 psql -U postgres -d postgres -f /work/example.sql
rem docker stop pg1
```

build
```
npm install
npm start
```

then `http://localhost:3000/example.html`


## finally

webpgfn is a simple PoC to author web-api' app-logic in pg stored functions. other callbacks (ex: node-fetch for http/https) are to be customized as needed.

