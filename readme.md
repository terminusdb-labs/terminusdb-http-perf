# HTTP testing with TerminusDB

This repository contains experimental scripts for HTTP testing using [`k6`][].
All scripts assume that `terminusdb` is running at `http://127.0.0.1:6363`.

## Running a script

To run the script `response/ok.js`:

```sh
k6 run response/ok.js
```

This uses the default parameters, which include:
* 1 [virtual user][]: concurrent session, a.k.a. VU
* 1 [iteration][]: repetition of the same scenario

To run the script with 5 iterations:

```sh
k6 run --iterations 5 response/ok.js
# or:
k6 run -i 5 response/ok.js
```

To run it with 5 iterations [shared] by 5 VUs:

```sh
k6 run --iterations 5 --vus 5 response/ok.js
# or:
k6 run -i 5 -u 5 response/ok.js
# or, leaving no space after the short flag:
k6 run -i5 -u5 response/ok.js
```

To output HTTP requests and responses, use `--http-debug=full`.

## Response time testing

The scripts in [`response/`][] are for response time testing. That is, we use
them to test how long a particular route takes from receiving an HTTP request to
sending the HTTP response.

These scripts are designed to be run with an arbitrary number of iterations but
_only one virtual user_. If you run them with more than one VU, the response
time will probably not accurately reflect how long the operation took. Also, you
might cause other problems with the server, depending on which operation you're
testing.

To determine the response time of, say, the `/api/ok` route, run the script with
a sufficiently high number of iterations to give a good average approximation of
the time:

```sh
k6 run -i20 response/ok.js
```

You will get output, called the [end-of-test summary report][], that looks
something like this:

```
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: ./response/ok.js
     output: -

  scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 20 iterations shared among 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


running (00m20.1s), 0/1 VUs, 20 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m20.1s/10m0s  20/20 shared iters

     data_received..................: 2.7 kB 132 B/s
     data_sent......................: 1.7 kB 86 B/s
     http_req_blocked...............: avg=23.55µs min=4µs    med=5µs    max=360µs   p(90)=11.1µs p(95)=29.4µs 
     http_req_connecting............: avg=14.45µs min=0s     med=0s     max=289µs   p(90)=0s     p(95)=14.45µs
     http_req_duration..............: avg=2.3ms   min=1.4ms  med=1.76ms max=10.22ms p(90)=2.81ms p(95)=3.18ms 
       { expected_response:true }...: avg=2.3ms   min=1.4ms  med=1.76ms max=10.22ms p(90)=2.81ms p(95)=3.18ms 
     http_req_failed................: 0.00%  ✓ 0        ✗ 20 
     http_req_receiving.............: avg=43.5µs  min=32µs   med=35µs   max=99µs    p(90)=65.7µs p(95)=90.45µs
     http_req_sending...............: avg=26.6µs  min=19µs   med=21µs   max=87µs    p(90)=31.8µs p(95)=49.95µs
     http_req_tls_handshaking.......: avg=0s      min=0s     med=0s     max=0s      p(90)=0s     p(95)=0s     
     http_req_waiting...............: avg=2.23ms  min=1.23ms med=1.69ms max=10.1ms  p(90)=2.72ms p(95)=3.1ms  
     http_reqs......................: 20     0.995252/s
     iteration_duration.............: avg=1s      min=1s     med=1s     max=1.01s   p(90)=1s     p(95)=1s     
     iterations.....................: 20     0.995252/s
     vus............................: 1      min=1      max=1
     vus_max........................: 1      min=1      max=1
```

Then, look for the `http_req_duration` row:

* If there is a row with `{ scenario:default }` under that, look at those
  numbers: they reflect the response time of interest, while the numbers next to
 `http_req_duration` include `setup` and `teardown`.
* If there is no row with `{ scenario:default }`, look at the
  `http_req_duration` row itself.

Useful numbers include the average (`avg`), median (`med`), and 90th percentile
(`p(90)`).


[`k6`]: https://k6.io/
[`response/`]: ./response
[end-of-test summary report]: https://k6.io/docs/getting-started/results-output/#end-of-test-summary-report
[iteration]: https://k6.io/docs/using-k6/options/#iterations
[shared]: https://k6.io/docs/using-k6/scenarios/executors/shared-iterations/
[virtual user]: https://k6.io/docs/using-k6/options/#vus
