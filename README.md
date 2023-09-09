# cottage-take-home

The approach I took was to map the file names to the phase names and sort the phases and stages by their prerequisites.  This
implementation accepts as input the file paths and produces as printed output the phases and stages structured as given in the
requirements.  Testing is performed in a shell script that performs full coverage.

This implementation assumes the `phases.json` file is provided last on the command line.  It also assumes the names of the files
are the names of the phases and correlates them ignoring case.

## Configure

Install [Node LTS](https://nodejs.org).
Run `npm i`.

## Build

Run `npm run build`.

## Run

Run `node process-phases.js construction.json design.json permitting.json phases.json`.

## Test

Run `npm test`.

## Windows

Node.js does not automatically expand command line arguments.  You must specify all arguments individually.

## Development Time

It took me about three and a half hours, broken up by chores and lunch.
