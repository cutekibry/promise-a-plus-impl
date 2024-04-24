"use strict";

import { Adapter } from "./adapter.mjs"; 

import promisesAplusTests from "promises-aplus-tests";

promisesAplusTests(Adapter, function (err) {
    console.log(err);
});