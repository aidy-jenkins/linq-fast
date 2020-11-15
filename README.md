# linq-fast
### A TypeScript implementation of .NET Linq / Enumerable for deferred evaluation, focussed on speed

&nbsp;

Bear in mind that this library is still in alpha.
The first draft of methods has been written but there is limited test coverage and therefore likely bugs

The most common methods, ```select```, ```where```, ```first``` etc. work well but more complex methods like groupBy will really punish large amounts of data with time complexity.

The aim is to get working versions implemented so the library can actually be used and update with more performant approaches later

&nbsp;

### Dependencies

&nbsp;

No 3rd party libs, only the vanilla JS standard library

This library can be used in browsers or NodeJS projects, some notes for older browser compatibility follow:

This library depends heavily on iterators and generator functions and uses lamda functions liberally, so in order to target some older browsers (*cough* IE *cough*) you will need to run through some kind of downlevelling compiler, i.e. Babel/TypeScript

The only other potential compatibility issue is that the ```longCount()``` method has return type of ```bigint``` which is not widely supported at the time of writing. ```bigint``` was used instead of ```number``` not only because it is a more appropriate substitute for the .NET ```long/int64``` data type, but also because just using ```number``` would make this method identical to ```count()```.
If you're having issues with an environment that doesn't support ```bigint```, avoid using this method or simply shim ```BigInt = Number``` and it should work for most use cases