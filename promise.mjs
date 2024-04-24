"use strict";

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
	constructor(fn) {
		this.status = PENDING;
		this.onFulfilledCallbacks = [];
		this.onRejectedCallbacks = [];
		this.value = undefined;
		this.reason = undefined;

		try {
			fn(this.resolve.bind(this), this.reject.bind(this));
		} catch (error) {
			this.reject(error);
		}
	}

	then(onFulfilled, onRejected) {
		let promise2 = new MyPromise(function () { });
		let realOnFulfilled, realOnRejected;

		if (typeof onFulfilled === "function")
			realOnFulfilled = onFulfilled;
		else
			realOnFulfilled = value => value;

		this.onFulfilledCallbacks.push(value => {
			try {
				promise2.resolve(realOnFulfilled(value));
			} catch (error) {
				promise2.reject(error);
			}
		})

		if (typeof onRejected === "function")
			realOnRejected = onRejected;
		else
			realOnRejected = reason => { throw reason; }
		this.onRejectedCallbacks.push(reason => {
			try {
				promise2.resolve(realOnRejected(reason));
			} catch (error) {
				promise2.reject(error);
			}
		})

		if (this.status !== PENDING)
			this.updateCallbacks();

		// console.log(`then(${onFulfilled}, ${onRejected}) =`, promise2);
		return promise2;
	}

	resolve(x) {
		if (x === this)
			throw TypeError("Promise should not resolve itself.");

		else if (x instanceof MyPromise)
			x.then(this.fulfill.bind(this), this.reject.bind(this));

		else if(x === null)
			this.fulfill(x);

		else if (typeof x === "function" || typeof x === "object") {
			let then;
			try {
				then = x.then;
			} catch (error) {
				this.reject(error);
			}

			if (typeof then === "function") {
				let isCalled = false;

				const resolvePromise = ((value) => {
					if (!isCalled) {
						isCalled = true;
						this.resolve(value);
					}
				}).bind(this);
				const rejectPromise = ((reason) => {
					if (!isCalled) {
						isCalled = true;
						this.reject(reason);
					}
				}).bind(this);

				try {
					then.call(x, resolvePromise, rejectPromise);
				} catch (error) {
					if (!isCalled)
						this.reject(error);
				}
			}

			else
				this.fulfill(x);
		}
		else
			this.fulfill(x);
	}

	fulfill(value) {
		if (this.status === PENDING) {
			this.status = FULFILLED;
			this.value = value;
			this.updateCallbacks();
		}
	}
	reject(reason) {
		if (this.status === PENDING) {
			this.status = REJECTED;
			this.reason = reason;
			this.updateCallbacks();
		}
	}

	updateCallbacks() {
		if (this.status === FULFILLED) {
			this.onFulfilledCallbacks.forEach(fn => setTimeout(fn, 0, this.value));
			this.onFulfilledCallbacks = [];
		}
		else if (this.status === REJECTED) {
			this.onRejectedCallbacks.forEach(fn => setTimeout(fn, 0, this.reason));
			this.onRejectedCallbacks = [];
		}
	}
}

export { MyPromise };

// 2.3.2.2: If / when`x` is fulfilled, fulfill`promise` with the same value.
//       `x` is already - fulfilled
// 1) via return from a fulfilled promise
// 2) via return from a rejected promise