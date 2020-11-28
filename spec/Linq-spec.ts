import {Collection, linq} from "../src/Linq";

describe("Linq", () => {

    const testNumbers = linq([1,2,3,4,5,6,7,8,9,10]);
    const testStrings = linq(["A", "B", "C", "D", "E", "F", "G", "H"]);

    describe("Aggregate", () => {
        it("Should aggregate using the provided accumulator function", () => {
            let foo = linq([1,2,3]).aggregate((a, b) => (a + b));
            expect(foo).toBe(6);
        });

        it("Should accept a seed and result selector", () => {
            let foo = linq([1,2,3]).aggregate(7, (a, b) => (a + b), result => result.toString());

            expect(foo).toBe("13");
        });
    });

    describe("All", () => {
        it("Should return true when predicate is true for all items", () => {
            let result = testNumbers.all(x => (typeof x === "number"));

            expect(result).toBe(true);
        });

        it("Should return false when predicate is false for some items", () => {
            let result = testNumbers.all(x => (x < 5));

            expect(result).toBe(false);
        });
    });

    describe("Any", () => {

        it("Should return true if there are any items in the list", () => {
            expect(testNumbers.any()).toBe(true);
        });

        it("Should return false if there are no items in the list", () => {
            expect(linq([]).any()).toBe(false);
        });

        it("Should return true when predicate is true for any item", () => {
            let result = testNumbers.any(x => (x < 5));

            expect(result).toBe(true);
        });

        it("Should return false when predicate is false for all items", () => {
            let result = testNumbers.any(x => (typeof x === 'string'));

            expect(result).toBe(false);
        });
    });

    describe("Append", () => {
        it("Should return a collection with the given item added to the end", () => {
            let collection = testNumbers.append(11);
            expect(collection.count()).toBe(11);
            expect(collection.last()).toBe(11);
        });
    });

    describe("Average", () => {
        it("Should return the mean average for a set of numbers", () => {
            expect(testNumbers.average()).toBe(5.5);
        });
    });

    describe("Cast", () => {
        it("Should convert the type of all items in the collection", () => {
            let result = linq([1,2,3]).cast("string");
            expect(result.toArray()).toEqual(["1", "2", "3"]);
        });

        it("Should convert the type of all items in the collection 2", () => {
            let array = [1,2,3];
            let result = linq(array).select(x => x.toString()).cast("number");
            
            expect(result.toArray()).toEqual(array);
        })

    });

    describe("Collection", () => {
        it("Should return a collection when passed an iterable", () => {
            let foo = linq([1]);
            expect(foo).toBeInstanceOf(Collection);
        });
    });

    describe("Concat", () => {
        it("Should return the concatenation of two sets", () => {
            let result = testNumbers.concat(testNumbers);

            let pureArray = testNumbers.toArray();
            let pureConcat = pureArray.concat(pureArray);

            expect(result.toArray()).toEqual(pureConcat);
        });

        it("Should not remove duplicate items", () => {
            let collection = linq([1,2]).concat(linq([1]));

            expect(collection.toArray()).toEqual([1,2,1]);
        });
    });

    describe("Contains", () => {
        it("Should return true if an item is contained in a collection", () => {
            expect(testNumbers.contains(7)).toBe(true);
        });

        it("Should return false if an item is not contained in a collection", () => {
            expect(testNumbers.contains(1000)).toBe(false);
        });
    });

    describe("Count", () => {
        it("Should return the accurate count of items in the collection", () => {
            expect(testNumbers.count()).toBe(testNumbers.toArray().length);
        });
    });

    describe("DefaultIfEmpty", () => {
        it("Should return the collection if it contains values", () => {
            let result = testNumbers.defaultIfEmpty();
            expect(result).toBe(testNumbers);
        });

        it("Should return a singleton collection of the given default value if empty", () => {
            let result = linq([]).defaultIfEmpty(7);
            expect(result.toArray()).toEqual([7]);
        });

        it("Should return a singleton collection of null if no given default", () => {
            let result = linq([]).defaultIfEmpty();
            expect(result.toArray()).toEqual([null]);
        });
    });

    describe("Distinct", () => {
        it("Should return a distinct list of items by order of first occurrence", () => {
            let result = testNumbers.concat(testNumbers).distinct();

            expect(result.toArray()).toEqual(testNumbers.toArray());
        });

        it("Should return a distinct list of items as determined by the given comparer", () => {
            let result = linq([1,2,3]).distinct(() => true);

            expect(result.toArray()).toEqual([1]);
        });
    });

    describe("ElementAt", () => {
        it("Should return the element at the given index of the list", () => {
            let array = testNumbers.toArray();

            for(let i = 0; i < array.length; ++i) {
                expect(testNumbers.elementAt(i)).toBe(array[i]);
            }
        });

        it("Should throw if the index is outside the bounds of the collection", () => {
            expect(() => testNumbers.elementAt(-1)).toThrowError("Index not found");
        });
    });

    describe("ElementAtOrDefault", () => {
        it("Should return the result of ElementAt if it has value", () => {
            let array = testNumbers.toArray();

            for(let i = 0; i < array.length; ++i) {
                expect(testNumbers.elementAtOrDefault(i)).toBe(array[i]);
            }
        });

        it("Should return null if the index was not found", () => {
            expect(testNumbers.elementAtOrDefault(-1)).toBe(null);
        });
    });

    describe("Empty", () => {
        it("Should return an empty collection", () => {
            let empty = Collection.empty();

            expect(empty.any()).toBe(false);
            expect(empty.toArray().length).toBe(0);
        });
    });

    describe("Except", () => {
        it("Should return items from the first list that are not in the second", () => {
            let result = testNumbers.except(linq([1,2,3,4,5,6]));
            
            expect(result.toArray()).toEqual([7,8,9,10]);
        });

        it("Should return items where comparer is false", () => {
            let result = testNumbers.except(linq([1]), (a, b) => a === 2 || b === 2);

            expect(result.toArray()).toEqual([1,3,4,5,6,7,8,9,10]);
        });
    });

    describe("First", () => {
        it("Should return the first item in the list", () => {
            let test = linq([1,2,3]);

            let result = test.first();

            expect(result).toBe(1);
        });

        it("Should only iterate the first item in the list", () => {
            let test = linq([1, "Error"]);

            let result = test.select(item => {
                if(item === "Error")
                    throw item;

                return item;
            });


            expect(result.first()).toBe(1);
        });

        it("Should return the first item matching the predicate", () => {
            expect(testNumbers.first(x => x === 2)).toBe(2);
        });

        it("Should throw if there are no items", () => {
            expect(() => linq([]).first()).toThrowError("No value found");
            expect(() => linq([1]).first(x => x === 2)).toThrowError("No value found");
        });
    });

    describe("FirstOrDefault", () => {
        it("Should return the first item in the list", () => {
            expect(testNumbers.firstOrDefault()).toBe(1);
        });

        it("Should return the first item matching the predicate", () => {
            expect(testNumbers.firstOrDefault(x => x === 2)).toBe(2);
        });

        it("Should return null if there are no items", () => {
            expect(linq([]).firstOrDefault()).toBe(null);

            expect(linq([1]).firstOrDefault(x => x === 2)).toBe(null);
        });
    });

    describe("GroupBy", () => {
        it("Should group by the given key", () => {
            let grouped = testNumbers.groupBy(x => (x < 5));
            expect(grouped.first(group => group.key === false).all(x => (x < 5))).toBe(false);
            expect(grouped.first(group => group.key === true).all(x => (x < 5))).toBe(true);
        });

        it("Should select by key and element", () => {
            let grouped = testNumbers.groupBy(item => item, item => item.toString());
            expect(grouped.first(group => group.key === 1).first()).toBe("1");
        });
    });

    describe("GroupJoin", () => {
        it("Should allow me to join two sets by a common key", () => {
            let result = testNumbers.groupJoin(testNumbers, outer => outer, inner => inner, (outer, inner) => `${outer};${inner.first()}`);
            
            expect(result.toArray()).toEqual(testNumbers.select(x => `${x};${x}`).toArray());
        });
    });

    describe("Intersect", () => {
        it("Should return the intersection of two sets", () => {
            let result = testNumbers.where(x => x <= 6).intersect(testNumbers.where(x => x >= 4));

            expect(result.toArray()).toEqual([4,5,6]);
        });

        it("Should return empty if no intersection", () => {
            let result = linq([1]).intersect(linq([2]));

            expect(result.toArray()).toEqual([]);
        });
    });

    describe("Join", () => {
        it("Should allow me to join two sets by a common key", () => {
            let result = testNumbers.join(testNumbers, outer => outer, inner => inner, (outer, inner) => `${outer};${inner}`);
            
            expect(result.toArray()).toEqual(testNumbers.select(x => `${x};${x}`).toArray());
        
        });
    });

    describe("Last", () => {
        it("Should return the last item in a sequence", () => {
            expect(testNumbers.last()).toBe(10);
        });

        it("Should return the last item for the given predicate", () => {
            expect(testNumbers.last(x => x < 10)).toBe(9);
        });

        it("Should throw if no item found", () => {
            expect(() => linq([]).last()).toThrowError("No item found");
            expect(() => linq([1]).last(x => false)).toThrowError("No item found");
        });
    });

    describe("LastOrDefault", () => {
        it("Should return the last item in the list", () => {
            expect(testNumbers.lastOrDefault()).toBe(10);
        });

        it("Should return the first item matching the predicate", () => {
            expect(testNumbers.lastOrDefault(x => x === 2)).toBe(2);
        });

        it("Should return null if there are no items", () => {
            expect(linq([]).lastOrDefault()).toBe(null);

            expect(linq([1]).lastOrDefault(x => x === 2)).toBe(null);
        });
    });

    describe("LongCount", () => {
        it("Should return the number of elements in the collection", () => {
            expect(Number(testNumbers.longCount())).toBe(10);
        });

        it("Should return the same value as Count", () => {
            expect(Number(testStrings.longCount())).toBe(testStrings.count());
        });

        if(eval("BigInt") !== void 0) {
            it("Should return bigint if available", () => {
                expect(typeof testStrings.longCount()).toBe("bigint");
            });
        }
    });

    describe("Max", () => {
        it("Should return the highest number in a collection", () => {
            expect(testNumbers.max()).toBe(10);
        });

        it("Should return the highest number in an unordered collection", () => {
            expect(testNumbers.reverse().max()).toBe(10);
        });
    });

    describe("Min", () => {
        it("Should return the lowest number in a collection", () => {
            expect(testNumbers.min()).toBe(1);
        });

        it("Should return the lowest number in an unordered collection", () => {
            expect(testNumbers.reverse().min()).toBe(1);
        });
    });

    describe("OfType", () => {
        let mixedCollection = linq([1,"2",3, "4"]);

        it("Should return all the numbers in a mixed collection", () => {
            let collection = mixedCollection.ofType("number");
            expect(collection.toArray()).toEqual([1,3]);
        });

        it("Should return all the strings in a mixed collection", () => {
            let collection = mixedCollection.ofType("string");
            expect(collection.toArray()).toEqual(["2", "4"]);
        });
    });

    describe("OrderBy", () => {
        it("Should order items by the given key", () => {
            let col = linq(testNumbers.toArray().reverse()).orderBy(item => item);

            expect(col.toArray()).toEqual(testNumbers.toArray());
        });

        it("Should order strings by the given key", () => {
            let col = testStrings.reverse().orderBy(item => item);

            expect(col.toArray()).toEqual(testStrings.toArray());
        });
    });

    describe("OrderByDescending", () => {
        it("Should order items by the given key", () => {
            let col = linq(testNumbers.toArray()).orderByDescending(item => item);

            expect(col.toArray()).toEqual(testNumbers.toArray().reverse());
        });

        it("Should order strings by the given key", () => {
            let col = testStrings.orderByDescending(item => item);

            expect(col.toArray()).toEqual(testStrings.toArray().reverse());
        });
    });

    describe("Prepend", () => {
        it("Should return a collection prefixed with the given item", () => {
            let result = testNumbers.prepend(0);
            
            expect(result.count()).toBe(11);
            expect(result.first()).toBe(0);
        });
    });

    describe("Range", () => {
        it("Should return a sequence of the given length", () => {
            let result = Collection.range(0, 10);

            expect(result.count()).toBe(10);
        });

        it("Should return the numbers from the given start", () => {
            let result = Collection.range(1, 10);

            expect(result.toArray()).toEqual(testNumbers.toArray());
        });
    });

    describe("Repeat", () => {
        it("Should return the count number of items", () => {
            let result = Collection.repeat(1, 12);

            expect(result.count()).toBe(12);
        });

        it("Should return the given item the given number of times", () => {
            let result = Collection.repeat(1, 5);

            expect(result.toArray()).toEqual([1,1,1,1,1]);
        });
    });

    describe("Reverse", () => {
        it("Should return the collection in reverse order", () => {
            expect(testNumbers.reverse().toArray()).toEqual(testNumbers.toArray().reverse());
        });
    });

    describe("Select", () => {
        it("Should return the result of my callback function for each element", () => {
            let test = linq([1, 2, 3, 4]);

            let result = test.select(num => num.toString());

            expect(result.toArray()).toEqual(["1", "2", "3", "4"]);
        });
    });

    describe("SelectMany", () => {
        it("Should flatten a collection of collections", () => {
            let result = testNumbers.select(num => linq([num])).selectMany(x => x);

            expect(result.toArray()).toEqual(testNumbers.toArray());
        });
    });

    describe("SequenceEqual", () => {
        it("Should return true if two sequences are equal", () => {
            let result = testNumbers.sequenceEqual(Collection.range(1, 10));

            expect(result).toBe(true);
        });

        it("Should return false if two sequences are not equal", () => {
            let result = testNumbers.sequenceEqual(Collection.range(0, 10));

            expect(result).toBe(false);

        });

        it("Should return false for sequences of different lengths", () => {
            let result = linq([1]).sequenceEqual(linq([1,2]));

            expect(result).toBe(false);
        });
    });

    describe("Single", () => {
        it("Should throw if more than one item in sequence", () => {
            expect(() => testNumbers.single()).toThrowError("More than one value present in sequence");
        });

        it("Should return an item if it is the only value in a sequence", () => {
            let result = linq([1]).single();

            expect(result).toBe(1);
        });

        it("Should return a single item matching the given predicate", () => {
            let result = testNumbers.single(x => x === 2);

            expect(result).toBe(2);
        });

        it("Should throw if no items in the sequence", () => {
            expect(() => linq([]).single()).toThrowError("No value found");
        });

        it("Should throw if no items matching the predicate", () => {
            expect(() => testNumbers.single(x => x === -1)).toThrowError("No value found");
        });
    });

    describe("SingleOrDefault", () => {
        it("Should throw if more than one item in sequence", () => {
            expect(() => testNumbers.singleOrDefault()).toThrowError("More than one value present in sequence");
        });

        it("Should return an item if it is the only value in a sequence", () => {
            let result = linq([1]).singleOrDefault();

            expect(result).toBe(1);
        });

        it("Should return a single item matching the given predicate", () => {
            let result = testNumbers.singleOrDefault(x => x === 2);

            expect(result).toBe(2);
        });

        it("Should return null if no items in the sequence", () => {
            expect(linq([]).singleOrDefault()).toBe(null);
        });

        it("Should return null if no items matching the predicate", () => {
            expect(testNumbers.singleOrDefault(x => x === -1)).toBe(null);
        });
    });

    describe("Skip", () => {
        it("Returns a collection missing the given number of items", () => {
            let result = testNumbers.skip(3);

            expect(result.toArray()).toEqual([4,5,6,7,8,9,10]);
        });

        it("Returns empty if a collection has fewer items than skipped", () => {
            let result = linq([1,2]).skip(4);

            expect(result.toArray()).toEqual([]);
        });
    });

    describe("SkipLast", () => {
        it("Returns a collection missing the given number of items from the end", () => {
            let result = testNumbers.skipLast(4);

            expect(result.toArray()).toEqual([1,2,3,4,5,6]);
        });

        it("Returns empty if a collection has fewer items than skipped", () => {
            let result = linq([1,2]).skip(4);

            expect(result.toArray()).toEqual([]);
        });
    });

    describe("SkipWhile", () => {
        it("Should skip the first items for which the condition is true", () => {
            let result = linq([1,2,3,1]).skipWhile(num => num < 3);

            expect(result.toArray()).toEqual([3,1]);
        });

        it("Should return an empty list if all values match the condition", () => {
            let result = linq([1,1,1]).skipWhile(num => num === 1);
            
            expect(result.toArray()).toEqual([]);
        });

        it("Should return empty for an empty collection", () => {
            let result = linq([]).skipWhile(() => true);

            expect(result.toArray()).toEqual([]);
        });
    });

    describe("Sum", () => {
        it("Should return the sum of a set of numbers", () => {
            let sum = testNumbers.sum();

            expect(sum).toBe(55);
        });

        it("Should throw for an empty collection", () => {
            expect(() => Collection.empty<number>().sum()).toThrowError("No values in collection");
        });
    });

    describe("Take", () => {
        it("Should return a subset with the given number of items", () => {
            let result = testNumbers.take(3);

            expect(result.toArray()).toEqual([1,2,3]);
        });

        it("Should return a collection of all items if less than the given number", () => {
            let result = linq([1,2]).take(4);

            expect(result.toArray()).toEqual([1,2]);
        });

        it("Should return all items if count is negative", () => {
            let result = testNumbers.take(-1);

            expect(result.toArray()).toEqual(testNumbers.toArray());
        });
    });

    describe("TakeLast", () => {
        it("Should return a subset with the given number of items from the end", () => {
            let result = testNumbers.takeLast(3);

            expect(result.toArray()).toEqual([8,9,10]);
        });

        it("Should return a collection of all items if less than the given number", () => {
            let result = linq([1,2]).takeLast(4);

            expect(result.toArray()).toEqual([1,2]);
        });

        it("Should return an empty collection if count is negative", () => {
            let result = testNumbers.takeLast(-1);

            expect(result.toArray()).toEqual([]);
        });
    });

    describe("TakeWhile", () => {
        it("Should take the first items for which the condition is true", () => {
            let result = linq([1,2,3,1]).takeWhile(num => num < 3);

            expect(result.toArray()).toEqual([1,2]);
        });

        it("Should return all items if all values match the condition", () => {
            let result = linq([1,1,1]).takeWhile(num => num === 1);
            
            expect(result.toArray()).toEqual([1,1,1]);
        });

        it("Should return empty for an empty collection", () => {
            let result = linq([]).takeWhile(() => true);

            expect(result.toArray()).toEqual([]);
        });
    });

    describe("ThenBy", () => {
        const [zak, adam, will, hannah] = [{forename: "Zak", surname: "Smith"}, { forename: "Adam", surname: "Smith"}, {forename: "William", surname: "Johnson"}, { forename: "Hannah", surname: "Yang" }];
        const testPeople = linq([zak, adam, will, hannah]);
        const testPeopleBySurname = testPeople.orderBy(person => person.surname);
        
        it("Should apply a secondary sort after an order by", () => {
            let result = testPeopleBySurname.thenBy(person => person.forename);

            expect(result.toArray()).toEqual([will, adam, zak, hannah]);
        });
    });

    describe("ToArray", () => {
        it("Should return the contents of my collection as an array", () => {
            let test = linq([1,2,3]);
            
            let result = test.toArray();

            expect(result).toBeInstanceOf(Array);

            expect(result).toEqual([1,2,3]);
        });
    });

    describe("ToDictionary", () => {
        it("Should return a Map representing the collection by the given key", () => {
            let result = testStrings.toDictionary(x => x);

            expect(result.get("A")).toBe("A");
        });

        it("Should allow separate key and element selection", () => {
            let result = testNumbers.toDictionary(x => x, x => testStrings.elementAtOrDefault(x));

            expect(result.get(1)).toBe("B");
        })

        it("Should throw for duplicate keys", () => {
            expect(() => linq([1,1,1]).toDictionary(x => x)).toThrow();
        });
    });

    describe("ToHashSet", () => {
        it("Should return a set representing the collection", () => {
            let result = testNumbers.toHashSet();

            expect(Array.from(result.values())).toEqual(testNumbers.toArray());
        });
    });

    describe("ToList", () => {
        it("Should return the contents of my collection as an array", () => {
            let test = linq([1,2,3]);
            
            let result = test.toArray();

            expect(result).toBeInstanceOf(Array);

            expect(result).toEqual([1,2,3]);
        });
    });

    describe("ToLookup", () => {
        it("Should return a set of items per given key", () => {
            let result = testNumbers.toLookup(x => x < 5);

            expect(result.get(true).toArray()).toEqual(testNumbers.where(x => x < 5).toArray());
            expect(result.get(false).toArray()).toEqual(testNumbers.where(x => x >=5).toArray());
        });
    });

    describe("Union", () => {
        it("Should return the distinct union of two sets", () => {
            let result = linq([1,1,1]).union(linq([2,1,1]));

            expect(result.toArray()).toEqual([1,2]);
        });

        it("Should return one set concatenated with another where distinct", () => {
            let result = testNumbers.union(testStrings as Collection<any>);

            expect(result.toArray()).toEqual((testNumbers.toArray() as any[]).concat(testStrings.toArray()));
        });
    });

    describe("Where", () => {
        it("Should filter the contents based on my callback", () => {
            let test = linq([1,2,3,4,5]);

            let result = test.where(num => num < 4);

            expect(result.toArray()).toEqual([1,2,3]);
        });

        it("Should only iterate when needed", () => {
            let test = linq([1, 2, 3]);

            let count = 0;
            test.where(() => (++count, true)).first();

            expect(count).toBe(1);
        })
    });

    describe("Zip", () => {
        it("Should return the index joined result of two sets", () => {
            let result = Collection.zip(testNumbers, testNumbers);

            expect(result.select(([left, right]) => left).toArray()).toEqual(testNumbers.toArray());
            expect(result.select(([left, right]) => right).toArray()).toEqual(testNumbers.toArray());
        });

        it("Should return all matching indices from the shorter list if different lengths", () => {
            let result = Collection.zip(testNumbers, testStrings);

            expect(result.count()).toBe(testStrings.count());
        });
    })
});