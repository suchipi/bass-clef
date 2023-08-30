#!/usr/bin/env node
import { parseArgv } from "./index";

const offset = Number(process.env.CLEF_PARSE_ARGV_OFFSET || "2");
const result = parseArgv(process.argv.slice(offset));
console.log(JSON.stringify(result, null, 2));
