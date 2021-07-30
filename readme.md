# TerminusDB HTTP Performance Testing

This repository contains scripts for HTTP performance testing [TerminusDB][]
using [`k6`][].

## Getting Started

These instructions will get you started using the scripts in this repository for
HTTP performance testing TerminusDB. See [below](#development) for instructions
on getting started with developing the scripts.

First, [install `k6`][] and [install TerminusDB][]. Then, make sure the
`terminusdb` server is running at `http://127.0.0.1:6363`. Now, continue to the
next section for how to run the scripts.

## Running a Script

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
# or, leaving no space after the short flag:
k6 run -i5 response/ok.js
```

To run it with 5 iterations [shared][] by 5 VUs:

```sh
k6 run --iterations 5 --vus 5 response/ok.js
```

To output HTTP requests and responses, use `--http-debug=full`.

## Response Time Testing

The scripts in [`response/`][] are for response time testing. That is, we use
them to test how long a particular route takes from sending an HTTP request to
receiving the HTTP response.

These scripts are designed to be run with an arbitrary number of iterations but
_only one virtual user_. If you run them with more than one VU, the response
time will probably not accurately reflect how long the operation took. Also, you
might cause other problems with the server, depending on which operation you're
testing.

To determine the response time of, say, the `/api/ok` route, run the script with
a sufficiently high number of iterations to give a good average approximation of
the time:

```sh
k6 run --iterations 20 response/ok.js
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
           * default: 20 iterations shared among 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


running (00m20.7s), 0/1 VUs, 20 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m20.7s/10m0s  20/20 shared iters
     http_req_duration...: avg=32.69ms min=26.95ms med=30.18ms max=70.2ms p(90)=33.52ms p(95)=37.72ms
```

Then, look at the `http_req_duration` row. This provides statistics on the total
time from the initiation of the request to the receipt of the complete response.
Useful numbers include the average (`avg`), median (`med`), and 90th percentile
(`p(90)`).

## Benchmarking and Generating Metrics

For this, you will need [`jq`][], which is used to transform the output from
`k6` into input for our continuous benchmarking GitHub Action. So, first,
[install `jq`][] and make sure it's available in your `$PATH`.

To run the benchmark script, which includes all the routes of interest, and
create a [JSON results file][]:

```sh
k6 run --iterations 20 --out json=results.json response/all.js
```

To create another JSON file with aggregate metrics from the above output, run
the [`./metrics.sh`][] script:

```sh
./metrics.sh results.json > metrics.json
```

## Development

### Getting Started

To get started working on the JavaScript code, install [Node.js][] and run
this in the top-level directory of the repository:

```
npm install
```

This creates a `node_modules/` directory and populates it with all of the
libraries and executables needed for development.

### Linting and Formatting JavaScript code

To lint and format JavaScript code, run [ESLint][] with:

```
npm run lint
```

### JSON Files

All user-created [JSON][] files should go into the [`json/`][] directory and
have the extension `.json`. That directory also contains an [NDJSON][]
(newline-delimited JSON) file for each JSON file. The JSON file is there to
support easy editing. The NDJSON files are used by the `k6` scripts.

After you add or edit a JSON file, run the following script to synchronize the
JSON and NDJSON file pairs:

```
npm run json
```

Don't forget to add any new or updated `.json` and `.ndjson` files in the
`json/` directory:

```
git add json
```


[TerminusDB]: https://terminusdb.com/
[`k6`]: https://k6.io/
[install `k6`]: https://k6.io/docs/getting-started/installation/
[install TerminusDB]: https://terminusdb.com/hub/download
[install `jq`]: https://stedolan.github.io/jq/download/
[`response/`]: ./response
[end-of-test summary report]: https://k6.io/docs/getting-started/results-output/#end-of-test-summary-report
[iteration]: https://k6.io/docs/using-k6/options/#iterations
[shared]: https://k6.io/docs/using-k6/scenarios/executors/shared-iterations/
[virtual user]: https://k6.io/docs/using-k6/options/#vus
[`jq`]: https://stedolan.github.io/jq/
[JSON results file]: https://k6.io/docs/results-visualization/json/
[`./metrics.sh`]: ./metrics.sh
[Node.js]: https://nodejs.org/en/
[ESLint]: https://eslint.org/
[JSON]: https://en.wikipedia.org/wiki/JSON
[`json/`]: ./json
[NDJSON]: https://en.wikipedia.org/wiki/JSON_streaming
