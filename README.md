# cottage-take-home

The approach I took was to map the file names to the phase names and sort the phases and stages by their prerequisites.  This
implementation accepts as input the file paths and produces as printed output the phases and stages structured as given in the
requirements.  Testing is performed in a shell script that performs full coverage.

This implementation assumes the `phases.json` file is provided last on the command line.  It also assumes the names of the files
are the names of the phases and correlates them ignoring case.

## Configure

`npm i`

## Build

`npm run build`

## Run

`node process-phases.js construction.json design.json permitting.json phases.json`

## Test

`npm run test`

Alternatively, run `./tesst` in a Bash prompt.

## Windows

Node.js does not automatically expand command line arguments.  You must specify all arguments individually.

To run the tests, run `./tesst` in a Bash prompt instead of running the NPM command.

## Development Time

It took me about three hours, broken up by chores and lunch.
