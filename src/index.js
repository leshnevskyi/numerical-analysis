import LinearSystem from './linearSystem.js';

const linearSystem = new LinearSystem([
	'2x+1y=3',
	'1x-2y=1',
]);

function logIterations(method, caption) {
	const approxSolutionsGen = linearSystem.solveIteratively(method);

	const approxSolutions = [];

	for (const solution of approxSolutionsGen) {
		for (const variable in solution) {
			solution[variable] = Number(solution[variable].toFixed(3));
		}
	
		approxSolutions.push(solution);
	}
	
	console.group(caption);
	console.table(approxSolutions);
	console.groupEnd();
}

logIterations(LinearSystem.methods.jacobi,'Метод Якобі');
logIterations(LinearSystem.methods.gaussSeidel, 'Метод Зейделя');