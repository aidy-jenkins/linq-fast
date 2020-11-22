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
        })
    })

    describe("Select", () => {
        it("Should return the result of my callback function for each element", () => {
            let test = linq([1, 2, 3, 4]);

            let result = test.select(num => num.toString());

            expect(result.toArray()).toEqual(["1", "2", "3", "4"]);
        });
    });

    describe("ToArray", () => {
        it("Should return the contents of my collection as an array", () => {
            let test = linq([1,2,3]);
            
            let result = test.toArray();

            expect(result).toEqual([1,2,3]);
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
});