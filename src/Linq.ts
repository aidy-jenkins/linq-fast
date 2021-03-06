export const Linq = <T = any>(data: Iterable<T>) => {
    return new Enumerable<T>(function* () {
        for(let item of data) {
            yield item;
        }
    });
};

type Comparer<TLeft, TRight = TLeft> = (a: TLeft, b: TRight) => boolean;
type OrderComparer<TLeft, TRight = TLeft> = (a: TLeft, b: TRight) => -1 | 0 | 1;
type Predicate<T> = (value: T) => boolean;

interface GroupItem<TKey, TElement> extends Enumerable<TElement> {
    key: TKey;
}

interface Grouping<TKey, TElement> extends Enumerable<GroupItem<TKey, TElement>> {
}

interface PrimitiveTypeMap {
    "number": number;
    "boolean": boolean;
    "string": string;
    "bigint": bigint;
}

export class Enumerable<T> {

    private static readonly TypeMap = {
        "number": Number,
        "boolean": Boolean,
        "string": String,
        "bigint": BigInt
    };

    aggregate(accumulatorFunc: (value1: T, value2: T) => T): T;
    aggregate<TAccumulate, TResult = TAccumulate>(seed: TAccumulate, accumulatorFunc: (accumulate: TAccumulate, value: T) => TAccumulate, resultSelector?: (accumulated: TAccumulate) => TResult): TResult;
    aggregate<TAccumulate = T, TResult = T>(arg0: TAccumulate | typeof accumulatorFunc, accumulatorFunc?: (accumulate: TAccumulate, value: T) => TAccumulate, resultSelector?: (accumulated: TAccumulate) => TResult): TResult {
        let seed: TAccumulate;
        if (arguments.length === 1 && typeof arg0 === 'function')
            accumulatorFunc = arg0 as typeof accumulatorFunc;
        else
            seed = arg0 as TAccumulate;

        for (let value of this.data) {
            if (seed !== void 0) {
                seed = accumulatorFunc(seed, value);
            }
            else {
                seed = value as any as TAccumulate; //Single arg overload
                continue;
            }
        }

        if (seed === void 0) {
            throw new TypeError("Sequence contained no elements");
        }

        if (resultSelector) {
            return resultSelector(seed);
        }

        return seed as any as TResult; //No resultselector overload
    }

    all(predicate: Predicate<T>) {
        for (let item of this.data) {
            if (!predicate(item))
                return false;
        }

        return true;
    }

    any(predicate?: Predicate<T>) {
        if (predicate)
            return !this.all(x => !predicate(x));
        else {
            let { done } = this.data[Symbol.iterator]().next();
            return !done;
        }
    }

    append(value: T) {
        return new Enumerable<T>(function* () {
            for (let item of this.data) {
                yield item;
            }
            yield value;
        }.bind(this));
    }

    average<TNum extends T & number>(): TNum {
        let array = this.toArray() as TNum[];
        return (array.reduce((ag, current) => ag + current, 0) / array.length) as TNum;
    }

    cast<TResult extends "number" | "boolean" | "string" | "bigint">(type: TResult) {
        return new Enumerable<PrimitiveTypeMap[TResult]>(function* () {
            for (let item of this.data) {
                yield Enumerable.TypeMap[type](item);
            }
        }.bind(this));
    }

    concat(collection: Enumerable<T>) {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            for (let item of this.data) {
                yield item;
            }

            for (let item of collection.data) {
                yield item;
            }
        }.bind(this));
    }

    contains(value: T): boolean;
    contains<TVal>(value: TVal, comparer: Comparer<T, TVal>): boolean;
    contains<TVal = T>(value: TVal, comparer?: Comparer<T, TVal>) {
        if (comparer)
            return this.any(val => comparer(val, value));
        else
            return this.any(val => val === value as any as T);
    }

    count(): number;
    count(predicate: Predicate<T>): number;
    count(predicate?: Predicate<T>) {
        if(predicate !== void 0)
            return this.where(predicate).count();
        
        let count = 0;
        for (let item of this.data)
            ++count;

        return count;
    }

    defaultIfEmpty(defaultValue?: T) {
        if (!this.any())
            return linq([defaultValue ?? null]);
        else
            return this;
    }

    distinct(comparer?: Comparer<T>) {
        if (!comparer)
            comparer = (a, b) => a === b;

        let returned = [] as T[];

        return new Enumerable<T>(function* (this: Enumerable<T>) {
            for (let item of this.data) {
                if (returned.every(value => !comparer(value, item))) { // OOOOFF this feels expensive, TODO think of a better way (but how without being able to hash?)
                    returned.push(item);
                    yield item;
                }
            }
        }.bind(this))
    }

    elementAt(index: number) {
        let { success, value } = this.elementAt_internal(index);

        if(!success)
            throw new TypeError("Index not found");

        return value;
    }

    elementAtOrDefault(index: number) {
        let {success, value } = this.elementAt_internal(index);
        if(!success)
            return null;

        return value;
    }

    private elementAt_internal(index: number): { success: boolean, value: T } {
        let i = 0;
        for (let item of this.data) {
            if (i === index)
                return { success: true, value: item};

            ++i;
        }

        return {success: false, value: null };
    }

    static empty<TResult>() {
        return linq([] as TResult[]);
    }

    except(collection: Enumerable<T>, comparer?: Comparer<T>) {
        if (!comparer)
            comparer = (a, b) => a === b;

        return this.where(item => !collection.any(x => comparer(x, item)));
    }

    first(predicate?: Predicate<T>): T {
        if (predicate)
            return this.where(predicate).first();

        let {success, value} = this.first_internal();
        if (!success) {
            throw new TypeError("No value found");
        }

        return value;
    }

    firstOrDefault(predicate?: Predicate<T>): T {
        if (predicate)
            return this.where(predicate).firstOrDefault();

        let {success, value} = this.first_internal();
        if (!success) {
            return null;
        }

        return value;
    }

    private first_internal(): { success: boolean, value: T} {
        let iterator = this.data[Symbol.iterator]();
        let { done, value } = iterator.next();

        return {success: !done, value };
    }

    groupBy<TKey>(keySelector: (item: T) => TKey): Grouping<TKey, T>;
    groupBy<TKey, TElement, TResult>(keySelector: (item: T) => TKey, options: Enumerable.GroupByArgs<T, TKey, TElement, TResult>): Grouping<TKey, TResult>;
    groupBy<TKey>(keySelector: (item: T) => TKey, additionalParameters: { comparer?: Comparer<TKey> }): Grouping<TKey, T>;
    groupBy<TKey, TElement = T>(keySelector: (item: T) => TKey, elementSelector: (item: T) => TElement, additionalParameters?: { comparer?: Comparer<TKey> }): Grouping<TKey, TElement>;
    groupBy<TKey, TElement = T, TResult = TElement>(keySelector: (item: T) => TKey, arg1?: any, additionalParameters?: { comparer?: Comparer<TKey> }): Grouping<TKey, TResult> {
        let options = Object.create(null) as Enumerable.GroupByArgs<T, TKey, TElement, TResult>;
        if (typeof arg1 === 'function')
            Object.assign(options, { elementSelector: arg1, ...additionalParameters });
        else
            Object.assign(options, arg1);

        let { elementSelector, resultSelector, comparer } = options;
        if (!elementSelector) elementSelector = x => x as any as TElement; //In this overload TElement must be equal to T
        if (!comparer) comparer = (a, b) => a === b;

        return new Enumerable<GroupItem<TKey, TResult>>(function* (this: Enumerable<T>) {
            let keys = this.select(keySelector).distinct();

            for (let key of keys) {
                let groupItem = Object.assign(this.where(item => comparer(key, keySelector(item))).select(elementSelector), { key }) as GroupItem<TKey, TElement>;
                if (resultSelector)
                    yield resultSelector(groupItem.key, groupItem);
                else
                    yield groupItem;
            }

        }.bind(this)) as Grouping<TKey, TResult>;
    }

    groupJoin<TInner, TKey, TResult>(inner: Enumerable<TInner>, outerKeySelector: (item: T) => TKey, innerKeySelector: (item: TInner) => TKey, resultSelector: (left: T, right: Enumerable<TInner>) => TResult, comparer?: Comparer<TKey>) {
        if (!comparer) comparer = (a, b) => a === b;

        return this.select(item => resultSelector(item, inner.where(innerItem => comparer(outerKeySelector(item), innerKeySelector(innerItem)))));
    }

    intersect(collection: Enumerable<T>, comparer?: Comparer<T>) {
        if (!comparer) comparer = (a, b) => a === b;

        return this.where(item => collection.contains(item, comparer));
    }

    join<TInner, TKey, TResult>(inner: Enumerable<TInner>, outerKeySelector: (item: T) => TKey, innerKeySelector: (item: TInner) => TKey, resultSelector: (left: T, right: TInner) => TResult, comparer?: Comparer<TKey>): Enumerable<TResult> {
        if (!comparer) comparer = (a, b) => a === b;

        return this.selectMany(item => inner.where(innerItem => comparer(outerKeySelector(item), innerKeySelector(innerItem))).select(innerItem => resultSelector(item, innerItem)));
    }

    last(predicate?: Predicate<T>) {
        if (!predicate) predicate = () => true;

        let notFound = true;
        let result: T;
        for (let item of this.data) {
            if (predicate(item)) {
                result = item;
                notFound = false;
            }
        }

        if (notFound)
            throw new TypeError("No item found");

        return result;
    }

    lastOrDefault(predicate?: Predicate<T>) {
        try {
            return this.last(predicate);
        }
        catch (err) {
            if (err.message === "No item found")
                return null;
            else
                throw err;
        }
    }

    longCount(predicate?: Predicate<T>) {
        if (!predicate) predicate = () => true;
        let count = BigInt(0);
        for (let item of this.data) {
            if (predicate(item))
                ++count;
        }
        return count;
    }

    max<TNum extends T & number>(): TNum {
        let array = this.toArray();
        if (array.length === 0)
            throw new TypeError("No values in collection");

        return array.reduce((prev, curr) => prev > curr ? prev : curr) as TNum;
    }

    min<TNum extends T & number>(): TNum {
        let array = this.toArray();
        if (array.length === 0)
            throw new TypeError("No values in collection");

        return array.reduce((prev, curr) => prev < curr ? prev : curr) as TNum;
    }

    ofType<TResult extends "number" | "boolean" | "string" | "bigint">(type: TResult): Enumerable<PrimitiveTypeMap[TResult]> {
        return this.where(item => typeof item === type) as any;
    }

    orderBy<TKey>(keySelector: (value: T) => TKey, comparer?: OrderComparer<TKey>) {
        if (!comparer) comparer = (a, b) => a < b ? -1 : 1;
        return new OrderedEnumerable<TKey, T>(function* (this: Enumerable<T>) {
            let values = this.select(item => [keySelector(item), item] as [TKey, T]).toArray();
            values.sort(([leftKey, _], [rightKey, __]) => comparer(leftKey, rightKey));
            for (let value of values)
                yield value;
        }.bind(this));
    }

    orderByDescending<TKey>(keySelector: (value: T) => TKey, comparer?: OrderComparer<TKey>) {
        if (!comparer) comparer = (a, b) => a < b ? -1 : 1;
        return this.orderBy(keySelector, (a, b) => (comparer(a, b) * -1) as -1 | 0 | 1);
    }

    prepend(value: T) {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            yield value;
            for (let item of this.data) {
                yield item;
            }
        }.bind(this));
    }

    static range(start: number, count: number) {
        return new Enumerable<number>((function* () {
            for (let i = start; i < (start + count); ++i)
                yield i;
        }));
    }

    static repeat<T>(value: T, count: number) {
        return new Enumerable<T>((function* () {
            for (let i = 0; i < count; ++i)
                yield value;
        }));
    }

    reverse() {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            let values = this.toArray().reverse();
            for (let item of values)
                yield item;
        }.bind(this));
    }


    [Symbol.iterator] = this._data;

    private get data() {
        return this._data();
    }

    constructor(
        protected _data: () => Generator<T>
    ) {

    }

    select<TOut>(callback: (value: T, index: number) => TOut): Enumerable<TOut> {
        return new Enumerable((function* (this: Enumerable<T>) {
            let iterator = this.data[Symbol.iterator]();

            for (let index = 0; true; ++index) {
                let { done, value } = iterator.next();
                if (done) break;

                yield callback(value, index);
            }
        }).bind(this));
    }

    selectMany<TResult>(selector: (item: T, index: number) => Enumerable<TResult>): Enumerable<TResult>;
    selectMany<TCollection, TResult>(collectionSelector: (item: T, index: number) => Enumerable<TCollection>, resultSelector: (item: T, collection: TCollection) => TResult): Enumerable<TResult>;
    selectMany<TCollection, TResult>(selector: (value: T, index: number) => Enumerable<TResult> | Enumerable<TCollection>, resultSelector?: (item: T, collection: TCollection) => TResult): Enumerable<TResult> {
        if (!resultSelector) resultSelector = (_, x) => x as any as TResult;

        return new Enumerable<TResult>(function* (this: Enumerable<T>) {
            let iterator = this.data[Symbol.iterator]();

            for (let index = 0; true; ++index) {
                let { done, value } = iterator.next();
                if (done) break;

                let collection = selector(value, index);
                if (resultSelector) {
                    for (let item of collection) {
                        yield resultSelector(value, item as TCollection);
                    }
                }
                else {
                    for (let item of collection) {
                        yield item;
                    }
                }
            }
        }.bind(this));
    }

    sequenceEqual(otherCollection: Enumerable<T>, comparer?: Comparer<T>) {
        if (!comparer) comparer = (a, b) => a === b;

        let iterator = this.data[Symbol.iterator]();
        let otherIterator = otherCollection.data[Symbol.iterator]();

        for (let index = 0; true; ++index) {
            let { done, value } = iterator.next();
            let { done: otherDone, value: otherValue } = otherIterator.next();
            if (done !== otherDone)
                return false;

            if (done) break;

            if (!comparer(value, otherValue))
                return false;
        }

        return true;
    }

    single(predicate?: Predicate<T>) {
        if (!predicate) predicate = () => true;

        let iterator = this.data[Symbol.iterator]();

        let item: T;
        let found = false;
        for (let index = 0; true; ++index) {
            let { done, value } = iterator.next();
            if (done) break;

            if (predicate(value)) {
                if (found)
                    throw new TypeError("More than one value present in sequence");

                item = value;
                found = true;
            }
        }

        if(!found)
            throw new TypeError("No value found");

        return item;
    }

    singleOrDefault(predicate?: Predicate<T>) {
        if (!predicate) predicate = () => true;

        let iterator = this.data[Symbol.iterator]();

        let item: T;
        let found = false;
        for (let index = 0; true; ++index) {
            let { done, value } = iterator.next();
            if (done) break;

            if (predicate(value)) {
                if (found)
                    throw new TypeError("More than one value present in sequence");

                item = value;
                found = true;
            }
        }

        return item ?? null;
    }

    skip(count: number) {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            let i = 0;
            for (let item of this.data) {
                if (i >= count) {
                    yield item;
                }
                ++i;
            }
        }.bind(this));
    }

    skipLast(count: number) {
        if (count <= 0) return linq(this.data);
        return this.reverse().skip(count).reverse();
    }

    skipWhile(condition: (value: T, index: number) => boolean) {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            let i = 0;
            let passed = false;
            for (let item of this.data) {
                if (!passed) {
                    if (condition(item, i))
                        continue;
                    else
                        passed = true;
                }
                yield item;
                ++i;
            }
        }.bind(this));
    }

    sum<TNum extends T & number>(): TNum {
        let array = this.toArray() as TNum[] as number[];
        if (array.length === 0)
            throw new TypeError("No values in collection");

        return array.reduce((prev, curr) => prev + (curr ?? 0), 0) as TNum;
    }

    take(count: number) {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            let i = 0;
            for (let item of this.data) {
                if (i === count) break;
                yield item;
                ++i;
            }
        }.bind(this));
    }

    takeLast(count: number) {
        if (count <= 0) return Enumerable.empty<T>();
        return this.reverse().take(count).reverse();
    }

    takeWhile(condition: (value: T, index: number) => boolean) {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            let i = 0;
            for (let item of this.data) {
                if (!condition(item, i))
                    break;

                yield item;
                ++i;
            }
        }.bind(this));
    }

    toArray() {
        return Array.from(this.data);
    }

    toDictionary<TKey>(keySelector: (value: T) => TKey, additionalParameters?: { comparer: Comparer<TKey> }): Map<TKey, T>;
    toDictionary<TKey, TValue>(keySelector: (value: T) => TKey, elementSelector: (value: T) => TValue, comparer?: Comparer<TKey>): Map<TKey, TValue>;
    toDictionary<TKey, TValue = T>(keySelector: (value: T) => TKey, arg1?: ((value: T) => TValue) | { comparer: Comparer<TKey> }, comparer?: Comparer<TKey>): Map<TKey, TValue> {
        let elementSelector: (value: T) => TValue;
        if (arg1) {
            if (typeof arg1 === 'function')
                elementSelector = arg1;
            else
                comparer = arg1.comparer;
        }
        let grouped = this.groupBy(keySelector, { comparer: comparer, elementSelector: elementSelector } as Enumerable.GroupByArgs<T, TKey, TValue, TValue>);
        let map = new Map();

        for (let item of grouped) {
            map.set(item.key, item.single());
        }

        return map;
    }

    toHashSet(comparer?: Comparer<T>) {
        return new Set(comparer ? this.distinct(comparer) : this.data);
    }

    toList() {
        return this.toArray();
    }

    toLookup<TKey>(keySelector: (value: T) => TKey, additionalParameters?: { comparer: Comparer<TKey> }): Map<TKey, Enumerable<T>>;
    toLookup<TKey, TValue>(keySelector: (value: T) => TKey, elementSelector: (value: T) => TValue, comparer?: Comparer<TKey>): Map<TKey, Enumerable<TValue>>;
    toLookup<TKey, TValue = T>(keySelector: (value: T) => TKey, arg1?: ((value: T) => TValue) | { comparer: Comparer<TKey> }, comparer?: Comparer<TKey>): Map<TKey, Enumerable<TValue>> {
        let elementSelector: (value: T) => TValue;
        if (arg1) {
            if (typeof arg1 === 'function')
                elementSelector = arg1;
            else
                comparer = arg1.comparer;
        }
        let grouped = this.groupBy(keySelector, { comparer: comparer, elementSelector: elementSelector } as Enumerable.GroupByArgs<T, TKey, TValue, TValue>);
        let map = new Map<TKey, Enumerable<TValue>>();

        for (let item of grouped) {
            map.set(item.key, item as Enumerable<TValue>);
        }

        return map;
    }

    union(collection: Enumerable<T>, comparer?: Comparer<T>) {
        return new Enumerable<T>(function* (this: Enumerable<T>) {
            for (let item of this.data) {
                yield item;
            }
            for (let item of collection) {
                yield item;
            }
        }.bind(this)).distinct(comparer);
    }

    where(predicate: (item: T, index: number) => boolean) {
        return new Enumerable<T>((function* () {
            let index = 0;
            for (let item of this.data) {
                if (predicate(item, index))
                    yield item;

                ++index;
            }
        }).bind(this));
    }

    static zip<TLeft, TRight>(leftCollection: Enumerable<TLeft>, rightCollection: Enumerable<TRight>): Enumerable<[TLeft, TRight]>;
    static zip<TLeft, TRight, TResult>(leftCollection: Enumerable<TLeft>, rightCollection: Enumerable<TRight>, resultSelector: (left: TLeft, right: TRight) => TResult): Enumerable<TResult>;
    static zip<TLeft, TRight, TResult = [TLeft, TRight]>(leftCollection: Enumerable<TLeft>, rightCollection: Enumerable<TRight>, resultSelector?: (left: TLeft, right: TRight) => TResult) {
        return new Enumerable<TResult>((function* () {
            let leftIterator = leftCollection.data[Symbol.iterator]();
            let rightIterator = rightCollection.data[Symbol.iterator]();

            for (let index = 0; true; ++index) {
                let { done, value } = leftIterator.next();
                let { done: otherDone, value: otherValue } = rightIterator.next();
                if (done || otherDone)
                    return;

                if(resultSelector)
                    yield resultSelector(value, otherValue);
                else
                    yield [value, otherValue] as unknown as TResult;
            }
        }));
    }
}

export module Enumerable {
    export interface GroupByArgs<T, TKey, TElement, TResult> {
        elementSelector?: (item: T) => TElement;
        resultSelector: (key: TKey, values: Enumerable<TElement>) => TResult;
        comparer?: Comparer<TKey>;
    }
}

class OrderedEnumerable<TOrderKey, T> extends Enumerable<T> {

    protected _sortedData: () => Generator<[TOrderKey, T]>;
    protected get sortedData() { 
        return this._sortedData();
    };

    

    constructor(
        data: () => Generator<[TOrderKey, T]>
    ) {
        super(null);
        this._sortedData = data;
        this._data = function* (this: OrderedEnumerable<TOrderKey, T>) {
            for(let [key, value] of this.sortedData) {
                yield value;
            }
        }.bind(this);
        
        this[Symbol.iterator] = this._data;
    }

    thenBy<TKey>(keySelector: (value: T) => TKey, comparer?: OrderComparer<TKey>) {
        return new OrderedEnumerable<TKey, T>(function* (this: OrderedEnumerable<TOrderKey, T>) {
            let grouped = linq(Array.from(this.sortedData)).groupBy(([key, value]) => key);
            
            for(let group of grouped) {
                let sortedGroup = linq(group).orderBy(([_, value]) => keySelector(value), comparer);
                for(let [key, [outerKey, value]] of sortedGroup.sortedData) {
                    yield [key, value];
                }
            }
        }.bind(this));
    }

    thenByDescending<TKey>(keySelector: (value: T) => TKey, comparer?: OrderComparer<TKey>) {
        if (!comparer) comparer = (a, b) => a < b ? -1 : 1;
        return this.thenBy(keySelector, (a, b) => (comparer(a, b) * -1) as -1 | 0 | 1);
    }
}

export const linq = Linq;

/** @deprecated Use Enumerable instead */
export class Collection<T> extends Enumerable<T> {}