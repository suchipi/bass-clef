import path from "path";
import { convertToCamelCase } from "./convert-case";

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
  } = {},
  {
    isAbsolute = path.isAbsolute,
    resolvePath = path.resolve,
    getCwd = process.cwd,
  }: {
    isAbsolute?: (somePath: string) => boolean;
    resolvePath?: (...parts: Array<string>) => string;
    getCwd?: () => string;
  } = {}
): {
  options: { [key: string]: any };
  positionalArgs: Array<string>;
  metadata: {
    optionNames: { [key: string]: string | undefined };
  };
} {
  const options: { [key: string]: any } = {};
  const optionNames: { [key: string]: string | undefined } = {};
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
        let rightHandValue: string | undefined;
        let valueComesFromNextArg: boolean;

        if (/=/.test(item)) {
          let equalsOffset = item.indexOf("=");
          const before = item.slice(0, equalsOffset);
          const after = item.slice(equalsOffset + 1);
          propertyName = convertToCamelCase(before);
          optionNames[before] = propertyName;
          rightHandValue = after;
          valueComesFromNextArg = false;
        } else {
          propertyName = convertToCamelCase(item);
          optionNames[item] = propertyName;
          rightHandValue = argv[0];
          valueComesFromNextArg = true;
        }

        let propertyValue: string | number | boolean;
        let propertyHint = hints[propertyName];

        if (propertyHint == null) {
          propertyHint = bestGuess(rightHandValue);
        }

        switch (propertyHint) {
          case Boolean: {
            if (rightHandValue === "false") {
              if (valueComesFromNextArg) {
                argv.shift();
              }
              propertyValue = false;
            } else {
              if (rightHandValue === "true") {
                if (valueComesFromNextArg) {
                  argv.shift();
                }
              }
              propertyValue = true;
            }
            break;
          }

          case Number: {
            if (valueComesFromNextArg) {
              argv.shift();
            }
            propertyValue = Number(rightHandValue);
            break;
          }

          case String: {
            if (valueComesFromNextArg) {
              argv.shift();
            }
            propertyValue = rightHandValue;
            break;
          }

          case Path: {
            if (valueComesFromNextArg) {
              argv.shift();
            }
            propertyValue = isAbsolute(rightHandValue)
              ? rightHandValue
              : resolvePath(getCwd(), rightHandValue);
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

  return { options, positionalArgs, metadata: { optionNames } };
}
