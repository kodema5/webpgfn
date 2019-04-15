# webpgfn

web-access to pg json-in json-out function

## install
```
    > npm install -g .
    > webpgfn
    listening on 3000
```

## examples

sql:

```
    > drop schema if exists foo cascade;
    > create schema foo;
    > create function foo.bar(a jsonb) returns jsonb as $$
    > begin
    >   return a;
    > end;
    > $$ language plpgsql;
    > select foo.bar('{"a":123}'::jsonb) as data;
```
js:

```
    (async() => {
        let res = await fetch('/foo.bar', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({a: 1, b: 'Textual content'})
        })

        console.log('---', await res.json())
    })();
```
