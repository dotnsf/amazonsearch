# Amazon Search

## Overview

Simple GET API to search items in Amazon.JP


## How to use API

- Simply access to `/{search keyword}`.

- You can sort result by `sort` query parameter:

  - `?sort=byprice` : by Price

  - `?sort=bypricedesc` : by Price(desc)

  - `?sort=byreview` : by Review point

  - `?sort=bydate` : by Date


## How to setup environment values.

- `AWS_TAG`:

  - Set Amazon PA TAG( like `xxxxxx-nn` ).

  - Tagged URL would be similar like this:

    - `https://www.amazon.co.jp/dp/(ASIN)?tag=(AWS_TAG)&linkCode=osi&th=1&psc=1`

- `CORS`:

  - Comma separated allowed origins for CORS.


## References

- **SearchIndex**: 

  - https://webservices.amazon.co.jp/paapi5/documentation/locale-reference/japan.html#search-index


- **Find ASIN by Keyword**: 

  - https://www.amazon.co.jp/s?k=(keyword)(&s=sortorder)(&i=searchindex)

- ASIN to Link:

  - https://www.amazon.co.jp/dp/(ASIN)?tag=(tag)&linkCode=osi&th=1&psc=1



## Licensing

This code islicensed under MIT.


## Copyright

2021 K.Kimura @ Juge.Me all rights reserved.



