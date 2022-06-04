import { Promisable } from 'type-fest';

declare global {
    interface Array<T> {
        /**
         * Async version of Array.prototype.filter
         * Returns the elements of an array that meet the condition specified in a callback function.
         * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
         */
        filterAsync(
            predicate: (value: T, index: number, array: T[]) => Promisable<unknown>,
            thisArg?: any,
        ): Promise<T[]>;

        /**
         * Variant of Array.prototype.filter with simple predicate that just tests for item not being null
         * Returns the elements of an array that is not null
         */
        filterNull(): Array<NonNullable<T>>;

        /**
         * Async version of Array.prototype.map
         * Calls a defined callback function on each element of an array, and returns an array that contains the results.
         * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        mapAsync<U>(predicate: (value: T, index: number, array: T[]) => Promisable<U>, thisArg?: any): Promise<U[]>;
    }
}

/**
 * In this function, we concentrate all global changes to the javascript runtime environment.
 * We know that doing global changes like extending prototypes is not a good practice but in few cases it is the most reasonable solution
 */
export function declareGlobals() {
    /*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
    (Array.prototype as any).filterAsync = async function <T>(
        predicate: (value: T, index: number, array: T[]) => Promisable<unknown>,
        thisArg?: any,
    ): Promise<T[]> {
        const predicates = await Promise.all((this as T[]).map(predicate, thisArg));
        return (this as T[]).filter((_, index) => predicates[index]);
    };

    (Array.prototype as any).filterNull = function <T>(): Array<NonNullable<T>> {
        return (this as T[]).filter((item) => item !== null) as Array<NonNullable<T>>;
    };

    (Array.prototype as any).mapAsync = async function <T, U>(
        callbackfn: (value: T, index: number, array: T[]) => Promisable<U>,
        thisArg?: any,
    ): Promise<U[]> {
        return Promise.all((this as T[]).map(callbackfn, thisArg));
    };
}
