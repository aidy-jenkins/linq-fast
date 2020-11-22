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
    })

    describe("Collection", () => {
        it("Should return a collection when passed an iterable", () => {
            let foo = linq([1]);
            expect(foo).toBeInstanceOf(Collection);
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
    });

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