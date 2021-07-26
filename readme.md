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
     script: response/ok.js
     output: -

  scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 1 iterations for each of 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


running (00m01.0s), 0/1 VUs, 1 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m01.0s/10m0s  1/1 iters, 1 per VU
     http_req_duration...: avg=3.23ms min=3.23ms med=3.23ms max=3.23ms p(90)=3.23ms p(95)=3.23ms
```

Then, look at the `http_req_duration` row. This provides statistics on the total
time from the initiation of the request to the receipt of the complete response.
Useful numbers include the average (`avg`), median (`med`), and 90th percentile
(`p(90)`).

## Development

### Linting and Formatting JavaScript code

Before you can lint and format the JavaScript code, install [Node.js][] and run
this in the top-level directory of the repository to install [ESLint][] in the
`node_modules/` directory:

```
npm install
```

To lint and format, run ESLint with:

```
npm run lint
```


[`k6`]: https://k6.io/
[`response/`]: ./response
[end-of-test summary report]: https://k6.io/docs/getting-started/results-output/#end-of-test-summary-report
[iteration]: https://k6.io/docs/using-k6/options/#iterations
[shared]: https://k6.io/docs/using-k6/scenarios/executors/shared-iterations/
[virtual user]: https://k6.io/docs/using-k6/options/#vus
[Node.js]: https://nodejs.org/en/
[ESLint]: https://eslint.org/
