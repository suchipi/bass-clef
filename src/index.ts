import path from "path";
import * as changeCase from "change-case";

export const Path = Symbol("Path");

export type Hint = typeof String | typeof Boolean | typeof Number | typeof Path;

function bestGuess(nextValue: string | undefined): Hint {
  if (nextValue === "true" || nextValue === "false") {
    return Boolean;
  } else if (nextValue == null || nextValue.startsWith("-")) {
    return Boolean;
  } else if (nextValue === String(Number(nextValue))) {
    return Number;
  } else {
    return String;
  }
}

export function parseArgv(
  argv: Array<string> = process.argv.slice(2),
  hints: {
    [key: string]: Hint | undefined | null;
  } = {}
): {
  options: any;
  positionalArgs: Array<string>;
} {
  const options: any = {};
  const positionalArgs: Array<any> = [];

  let isAfterDoubleDash = false;
  while (argv.length > 0) {
    let item = argv.shift();
    if (item == null) break;

    if (item === "--") {
      isAfterDoubleDash = true;
      continue;
    }

    if (item.startsWith("-")) {
      if (isAfterDoubleDash) {
        positionalArgs.push(item);
      } else {
        let propertyName: string;

        if (item.length === 2) {
          propertyName = item[1];
        } else {
          if (!item.startsWith("--")) {
            throw new Error(
              `Invalid command-line flag: '${item}'. Single-character command-line flags should only have one dash before them, and multi-character command-line flags should have two dashes before them. If you want to pass '${item}' as a positional argument, place it after a '--'.`
            );
          }
          propertyName = changeCase.camelCase(item.replace(/^--/, ""));
        }

        let propertyValue: string | number | boolean;
        let propertyHint = hints[propertyName];

        const nextValue = argv[0];

        if (propertyHint == null) {
          propertyHint = bestGuess(nextValue);
        }

        switch (propertyHint) {
          case Boolean: {
            if (nextValue === "false") {
              argv.shift();
              propertyValue = false;
            } else {
              if (nextValue === "true") {
                argv.shift();
              }
              propertyValue = true;
            }
            break;
          }

          case Number: {
            argv.shift();
            propertyValue = Number(nextValue);
            break;
          }

          case String: {
            argv.shift();
            propertyValue = nextValue;
            break;
          }

          case Path: {
            argv.shift();
            propertyValue = path.isAbsolute(nextValue)
              ? nextValue
              : path.resolve(process.cwd(), nextValue);
            break;
          }

          default: {
            throw new Error(`Invalid option hint: ${propertyHint}`);
          }
        }

        options[propertyName] = propertyValue;
      }
    } else {
      positionalArgs.push(item);
    }
  }

  return { options, positionalArgs };
}
