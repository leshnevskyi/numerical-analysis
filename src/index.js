import LinearSystem from './linearSystem.js';

const linearSystem = new LinearSystem([
	'1.13x+0.27y-0.22z-0.18w=-1.21',
	'-0.21x-0.65y+0.18z-0.18w=-0.33',
	'0.12x+0.13y-0.73z+0.18w=0.48',
	'0.33x-0.05y+0.06z-1.28w=-0.17',
]);

console.log(linearSystem.solve(LinearSystem.methods.cramer));