This repository contains experimental scripts for HTTP response time and load
testing using [`k6`][].

All scripts assume that `terminusdb` is running at `http://127.0.0.1:6363`.

To run the script `ping.js` with 1 virtual user (a.k.a. VU, concurrent client)
and 1 iteration:

```sh
k6 run ping.js
```

To run it with 1 VU and 5 iterations (repetitions of the same scenario):

```sh
k6 run --iterations 5 ping.js
```

To run it with 5 VUs and 5 iterations:

```sh
k6 run --vus 5 --iterations 5 ping.js
```

To output the HTTP requests and responses, use `--http-debug=full`.

[`k6`]: https://k6.io/
