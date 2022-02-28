import { test, expect } from "vitest";
import { parseArgv } from "./index";

test("basic test", () => {
  const result = parseArgv(["-v", "--some-flag", "52", "potato", "--", "--hi"]);

  expect(result).toMatchInlineSnapshot(`
    {
      "options": {
        "someFlag": 52,
        "v": true,
      },
      "positionalArgs": [
        "potato",
        "--hi",
      ],
    }
  `);
});

test("boolean hint", () => {
  const result = parseArgv(["-v", "potato"], { v: Boolean });

  expect(result).toMatchInlineSnapshot(`
    {
      "options": {
        "v": true,
      },
      "positionalArgs": [
        "potato",
      ],
    }
  `);
});

test("number hint", () => {
  const result = parseArgv(
    ["--some-num", "500", "--another-num", "this is a string tho"],
    { someNum: Number, anotherNum: Number }
  );

  expect(result).toMatchInlineSnapshot(`
    {
      "options": {
        "anotherNum": NaN,
        "someNum": 500,
      },
      "positionalArgs": [],
    }
  `);
});

test("null and undefined", () => {
  const result = parseArgv(["--first", "null", "--second", "undefined"]);

  expect(result).toMatchInlineSnapshot(`
    {
      "options": {
        "first": null,
        "second": undefined,
      },
      "positionalArgs": [],
    }
  `);
});

test("null and undefined with String hint", () => {
  const result = parseArgv(["--first", "null", "--second", "undefined"], {
    first: String,
    secong: String,
  });

  // I guess this is fine?
  expect(result).toMatchInlineSnapshot(`
    {
      "options": {
        "first": null,
        "second": undefined,
      },
      "positionalArgs": [],
    }
  `);
});
