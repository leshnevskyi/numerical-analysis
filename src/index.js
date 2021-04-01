import LinearSystem from './linearSystem.js';

const linearSystem = new LinearSystem([
	'1x-3y+2z=-3',
	'-1x+0y+5z=10',
	'-2x-1y-2z=7',
	'3x-1y-5z=-1',
	'-2x-1y+3z=-4',
]);

console.log(linearSystem.solve(LinearSystem.methods.choleskyDecomposition));