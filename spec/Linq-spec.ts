import {Collection, linq} from "../src/Linq";

describe("Linq", () => {
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