import LinearSystem from './linearSystem.js';

const linearSystem = new LinearSystem([
	'1x+0y+0z=1.4',
	'1x+1y+0z=-1.5',
	'1x+1y+1z=3.2',
	'0x+1y+0z=0.6',
	'0x+1y+1z=4.3',
	'0x+0y+1z=4.2'
]);

console.log(linearSystem.normal.coefficientMatrix);