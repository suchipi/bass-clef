import * as changeCase from "change-case";

export function parseArgv(
  argv: Array<string> = process.argv.slice(2),
  hints: {
    [key: string]: StringConstructor | BooleanConstructor | NumberConstructor;
  } = {}
) {
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
              `Invalid command-line flag: '${item}'. Single-character command-line flags should only have one dash before them, and multi-character command-line flags should have two dashes before them.`
            );
          }
          propertyName = changeCase.camelCase(item.replace(/^--/, ""));
        }

        let propertyValue: string | number | boolean | null | undefined;
        const propertyHint = hints[propertyName];

        const nextValue = argv[0];

        if (nextValue === "true" || nextValue === "false") {
          argv.shift();
          propertyValue = nextValue === "true";
        } else if (
          propertyHint === Boolean ||
          nextValue == null ||
          nextValue.startsWith("-")
        ) {
          propertyValue = true;
        } else if (nextValue === "null") {
          argv.shift();
          propertyValue = null;
        } else if (nextValue === "undefined") {
          argv.shift();
          propertyValue = undefined;
        } else if (
          propertyHint === Number ||
          (propertyHint == null && nextValue === String(Number(nextValue)))
        ) {
          argv.shift();
          propertyValue = Number(nextValue);
        } else {
          argv.shift();
          propertyValue = nextValue;
        }

        options[propertyName] = propertyValue;
      }
    } else {
      positionalArgs.push(item);
    }
  }

  return { options, positionalArgs };
}
