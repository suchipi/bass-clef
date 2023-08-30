import { test, expect } from "vitest";
import { parseArgv, Path } from "./index";

test("basic test", () => {
  const result = parseArgv(["-v", "--some-flag", "52", "potato", "--", "--hi"]);

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--some-flag": "someFlag",
          "-v": "v",
        },
      },
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

test("basic test (underscores in property names)", () => {
  const result = parseArgv(["-v", "--some_flag", "52", "potato", "--", "--hi"]);

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--some_flag": "someFlag",
          "-v": "v",
        },
      },
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
      "metadata": {
        "optionNames": {
          "-v": "v",
        },
      },
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
      "metadata": {
        "optionNames": {
          "--another-num": "anotherNum",
          "--some-num": "someNum",
        },
      },
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

  // They get treated as strings.
  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--first": "first",
          "--second": "second",
        },
      },
      "options": {
        "first": "null",
        "second": "undefined",
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

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--first": "first",
          "--second": "second",
        },
      },
      "options": {
        "first": "null",
        "second": "undefined",
      },
      "positionalArgs": [],
    }
  `);
});

test("empty", () => {
  const result = parseArgv([]);

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {},
      },
      "options": {},
      "positionalArgs": [],
    }
  `);
});

test("empty string arg", () => {
  const result = parseArgv([""]);

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {},
      },
      "options": {},
      "positionalArgs": [
        "",
      ],
    }
  `);
});

test("path hint (./)", () => {
  const result = parseArgv(
    [
      "--first-thing",
      "./blah",
      "--second-thing",
      "./blah",
      "--third-thing",
      "./blah",
    ],
    { firstThing: String, secondThing: Path },
    { getCwd: () => "/some/fake/path" }
  );

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--first-thing": "firstThing",
          "--second-thing": "secondThing",
          "--third-thing": "thirdThing",
        },
      },
      "options": {
        "firstThing": "./blah",
        "secondThing": "/some/fake/path/blah",
        "thirdThing": "./blah",
      },
      "positionalArgs": [],
    }
  `);
});

test("path hint (../)", () => {
  const result = parseArgv(
    [
      "--first-thing",
      "../blah",
      "--second-thing",
      "../blah",
      "--third-thing",
      "../blah",
    ],
    { firstThing: String, secondThing: Path },
    { getCwd: () => "/some/fake/path" }
  );

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--first-thing": "firstThing",
          "--second-thing": "secondThing",
          "--third-thing": "thirdThing",
        },
      },
      "options": {
        "firstThing": "../blah",
        "secondThing": "/some/fake/blah",
        "thirdThing": "../blah",
      },
      "positionalArgs": [],
    }
  `);
});

test("path hint (unqualified input)", () => {
  const result = parseArgv(
    [
      "--first-thing",
      "blah",
      "--second-thing",
      "blah",
      "--third-thing",
      "blah",
    ],
    { firstThing: String, secondThing: Path },
    { getCwd: () => "/some/fake/path" }
  );

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--first-thing": "firstThing",
          "--second-thing": "secondThing",
          "--third-thing": "thirdThing",
        },
      },
      "options": {
        "firstThing": "blah",
        "secondThing": "/some/fake/path/blah",
        "thirdThing": "blah",
      },
      "positionalArgs": [],
    }
  `);
});

test("relative path without hint specified", () => {
  const result = parseArgv(
    [
      "--first-thing",
      "blah",
      "--second-thing",
      "./blah",
      "--third-thing",
      "../blah",
    ],
    {},
    { getCwd: () => "/some/fake/path" }
  );

  // You can only make a path via hint.
  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--first-thing": "firstThing",
          "--second-thing": "secondThing",
          "--third-thing": "thirdThing",
        },
      },
      "options": {
        "firstThing": "blah",
        "secondThing": "./blah",
        "thirdThing": "../blah",
      },
      "positionalArgs": [],
    }
  `);
});

test("single-dash multi-char property name", () => {
  const result = parseArgv(["-version", "-help", "yeah"]);

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "-help": "help",
          "-version": "version",
        },
      },
      "options": {
        "help": "yeah",
        "version": true,
      },
      "positionalArgs": [],
    }
  `);
});

test("property name and value in one arg separated by equals", () => {
  const result = parseArgv([
    "-s=1",
    "--something=true",
    "--no-equals",
    "here",
    "--another_thing=yup",
    "--without-equals",
    "again",
  ]);

  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "--another_thing": "anotherThing",
          "--no-equals": "noEquals",
          "--something": "something",
          "--without-equals": "withoutEquals",
          "-s": "s",
        },
      },
      "options": {
        "anotherThing": "yup",
        "noEquals": "here",
        "s": 1,
        "something": true,
        "withoutEquals": "again",
      },
      "positionalArgs": [],
    }
  `);
});

test("example: ffmpeg argv", () => {
  const result = parseArgv([
    // argv0 is "ffmpeg", so it would go here, but parseArgv doesn't expect argv0
    "-i",
    "demo.mov",
    "-c:v",
    "libx265",
    "-crf",
    "28",
    "demo_out.mp4",
  ]);
  expect(result).toMatchInlineSnapshot(`
    {
      "metadata": {
        "optionNames": {
          "-c:v": "cV",
          "-crf": "crf",
          "-i": "i",
        },
      },
      "options": {
        "cV": "libx265",
        "crf": 28,
        "i": "demo.mov",
      },
      "positionalArgs": [
        "demo_out.mp4",
      ],
    }
  `);
});
