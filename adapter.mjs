"use strict";

import { MyPromise } from "./promise.mjs";

class Adapter {
    static resolved(value) {
        return new MyPromise((resolve, reject) => resolve(value));
    }
    static rejected(reason) {
        return new MyPromise((resolve, reject) => reject(reason));
    }
    static deferred() {
        let newPromise = new MyPromise((resolve, reject) => {});
        return {
            promise: newPromise,
            resolve: newPromise.resolve.bind(newPromise),
            reject: newPromise.reject.bind(newPromise)
        }
    }
}

export { Adapter };