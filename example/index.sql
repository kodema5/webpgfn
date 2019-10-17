drop schema if exists foo cascade;
create schema foo;

create function foo.bar(x jsonb) returns jsonb as $$
declare
    a int;
    b jsonb;
begin
    a = (x->>'a')::int;

    -- creates a sequnce of jobs by throwing exception
    b = jsonb_build_array(json_build_object(
        'url', 'pg://foo.baz',
        'ctx', x || jsonb_build_object('bar', a + 100)));
    raise exception 'callback: %', b::text;

end;
$$ language plpgsql;

create function foo.baz(x jsonb) returns jsonb as $$
declare
    a int;
    c jsonb;
begin
    a  = (x->>'bar')::int;
    c = x || jsonb_build_object('baz', a + 200);
    return c;
end;
$$ language plpgsql;
