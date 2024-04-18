class MyPromise {
    // 定义构造函数
    constructor(executor) {
        // 定义成功和失败的resolve和reject回调
        this.fulfilledEventSet = new Set();
        this.rejectedEventSet = new Set();
        // 初始化状态和结果
        this.status = MyPromise.PENDING;
        this.value = undefined;
        this.reason = undefined;
        // 执行 executor 函数
        const resolve = (value) => {
            if (this.status === MyPromise.PENDING) {
                this.status = MyPromise.FULFILLED;
                this.value = value;
                this.fulfilledEventSet.forEach((fn) => fn(value));
            }
            console.log(value, this.status, "初始化");
        };
        const reject = (reason) => {
            if (this.status === MyPromise.PENDING) {
                this.status = MyPromise.REJECTED;
                this.reason = reason;
                this.fulfilledEventSet.forEach((fn) => fn(reason));
            }
        };
        try {
            executor(resolve, reject);
        }
        catch (e) {
            reject(e);
        }
    }
    // 实现 then 方法
    //   Promise().then((res)=>{}, (err)=>{})
    then(onFulfilled, onRejected) {
        // 如果是函数直接用，不是函数就构造函数
        onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
        onRejected = typeof onRejected === "function" ? onRejected : (v) => v;
        // 返回一个Promise对象
        return new MyPromise((resolve, reject) => {
            // 状态是fulfilled时
            if (this.status === MyPromise.FULFILLED) {
                // 尝试给value赋值
                try {
                    // 使用queueMicrotask
                    queueMicrotask(() => {
                        // 拿到结果, 此时可能是promise对象，反之直接resolve
                        const result = onFulfilled(this.value);
                        this.promiseHandler(result, resolve, reject);
                    });
                }
                catch (error) {
                    reject(error);
                }
            } // 状态是rejected时
            else if (this.status === MyPromise.REJECTED) {
                try {
                    queueMicrotask(() => {
                        // 拿到结果, 此时可能是promise对象，反之直接resolve
                        const result = onRejected?.(this.value);
                        this.promiseHandler(result, resolve, reject);
                    });
                }
                catch (error) {
                    reject(error);
                }
            } //异步时
            else {
                console.log("异步执行");
                this.fulfilledEventSet.add((value) => {
                    // 尝试给value赋值
                    try {
                        // 使用queueMicrotask
                        queueMicrotask(() => {
                            // 拿到结果, 此时可能是promise对象，反之直接resolve
                            const result = onFulfilled(value);
                            this.promiseHandler(result, resolve, reject);
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                });
                this.rejectedEventSet.add((value) => {
                    try {
                        queueMicrotask(() => {
                            // 拿到结果, 此时可能是promise对象，反之直接resolve
                            const result = onRejected?.(value);
                            this.promiseHandler(result, resolve, reject);
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }
        });
    }
    catch() { }
    finally() { }
    // 如果是拿到result还是promise对象，继续then方法传递，反之直接resolve
    promiseHandler(result, resolve, reject) {
        if (result instanceof MyPromise) {
            result.then(resolve, reject);
        }
        else {
            resolve(result);
        }
    }
}
MyPromise.PENDING = "pending";
MyPromise.FULFILLED = "fulfilled";
MyPromise.REJECTED = "rejected";
export const run = () => {
    const p1 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve("success");
        }, 1000);
    });
    p1.then((res) => {
        console.log(res, "p1 then");
    });
    console.log(p1, "p1");
};