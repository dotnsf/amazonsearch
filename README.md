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


## References

- SearchIndex: 

  - https://webservices.amazon.co.jp/paapi5/documentation/locale-reference/japan.html#search-index


- Find ASIN by Keyword: 

  - https://www.amazon.co.jp/s?k=(keyword)(&s=sortorder)

- ASIN to Link:

  - https://www.amazon.co.jp/dp/(ASIN)?tag=(tag)&linkCode=osi&th=1&psc=1



## Licensing

This code islicensed under MIT.


## Copyright

2021 K.Kimura @ Juge.Me all rights reserved.



