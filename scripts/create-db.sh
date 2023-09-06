#!/bin/sh

sqlite3 ./public/data/1000000-bandcamp-sales2.db <<EOF
create table bandcamp(
    column00 BIGINT,
    _id TEXT,
    art_url TEXT,
    item_type TEXT,
    utc_date DOUBLE,
    country_code TEXT,
    track_album_slug_text TEXT,
    country TEXT,
    slug_type TEXT,
    amount_paid_fmt TEXT,
    item_price DOUBLE,
    item_description TEXT,
    art_id DOUBLE,
    url TEXT,
    amount_paid DOUBLE,
    releases DOUBLE,
    artist_name TEXT,
    currency TEXT,
    album_title TEXT,
    amount_paid_usd DOUBLE,
    package_image_id DOUBLE,
    amount_over_fmt TEXT,
    item_slug TEXT,
    addl_count DOUBLE
);
.schema bandcamp
.mode csv
.import ./public/data/1000000-bandcamp-sales.csv bandcamp --skip 1
.quit
EOF
