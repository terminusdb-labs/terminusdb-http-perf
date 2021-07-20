This repository contains experimental scripts for HTTP response time and load
testing using [`k6`][].

To run the script `ping.js` with 1 virtual user (“vu”) and 1 iteration:

```sh
k6 run ping.js
```

To run it with 5 virtual users (“vus”) and 5 iterations:

```sh
k6 run --vus 5 --iterations 5 ping.js
```

To output the HTTP requests and responses, use `--http-debug=full`.

[`k6`]: https://k6.io/
