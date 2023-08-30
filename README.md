# clef-parse

The argv parser behind [cleffa](https://npm.im/cleffa) and [clefairy](https://npm.im/clefairy).

## Usage

### As a node.js library

```ts
import { parseArgv } from "clef-parse";

// Sample argv
const result = parseArgv([
  "--bundle",
  "--input",
  "index.js",
  "--output",
  "bundle.js",
  "-v",
]);
console.log(result);
// Logs:
// {
//   options: { bundle: true, input: 'index.js', output: 'bundle.js', v: true },
//   positionalArgs: []
// }

// Optionally, you can provide type hints that will help the parser coerce values:
const result2 = parseArgv(
  ["--bundle", "--input", "index.js", "--output", "bundle.js", "-v"],
  {
    bundle: Boolean,
    input: String,
    output: String,
    v: Boolean,
  }
);
console.log(result2);
// Logs:
// {
//   options: { bundle: true, input: 'index.js', output: 'bundle.js', v: true },
//   positionalArgs: []
// }

// Valid hints are Number, Boolean, String, or Path. Number, Boolean, and String are the standard JS globals, but Path is a value exported by the library:
import { Path } from "clef-parse";

// When you provide the Path hint, clef-parse will convert the input string into an absolute path:
const result3 = parseArgv(
  ["--bundle", "--input", "index.js", "--output", "bundle.js", "-v"],
  {
    bundle: Boolean,
    input: Path,
    output: Path,
    v: Boolean,
  }
);
console.log(result3);
// Logs (for example):
// {
//   options: {
//     bundle: true,
//     input: '/home/suchipi/Code/clef-parse/index.js',
//     output: '/home/suchipi/Code/clef-parse/bundle.js',
//     v: true
//   },
//   positionalArgs: []
// }

// If you don't provide hints, clef-parse will do its best to guess.
```

See the TypeScript types in the source code for more information.

### As a CLI tool

```sh
$ npm install -g clef-parse
$ clef-parse one two --three-four=five
{
  "options": {
    "threeFour": "five"
  },
  "positionalArgs": [
    "one",
    "two"
  ]
}
```

You can't specify hints with the CLI tool.

## License

MIT
