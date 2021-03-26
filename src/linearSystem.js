import Matrix from './matrix.js';

class LinearSystem {
	static methods = {
		cramer: Symbol('Cramer\'s rule'),
		matrix: Symbol('matrix'),
		gaussianElimination: Symbol('Gaussian elimination'),
		luDecomposition: Symbol('LU decomposition'),
		jacobi: Symbol('Jacobi'),
		gaussSeidel: Symbol('Gauss–Seidel'),
	};

	#methods = {
		cramer: () => {
			const solution = {};
			const determinant = this.coefficientMatrix.determinant;

			if (determinant === 0) {
				console.error(`The determinant can't be zero`);

				return;
			}

			this.variables.forEach((variable, index) => {
				const replacedMatrix = this.coefficientMatrix.replaceCol(
					index, this.constTerms
				);

				solution[variable] = replacedMatrix.determinant / determinant;
			});

			return solution;
		},

		matrix: () => {
			const solution = {};
			const inverseMatrix = this.coefficientMatrix.inverse;
			const constTermMatrix = this.constTermMatrix;
			const solutionMatrix = inverseMatrix.multiply(constTermMatrix);

			this.variables.forEach((variable, index) => {
				solution[variable] = solutionMatrix.rows[index][0];
			});

			return solution;
		},

		gaussianElimination: () => {
			const solution = {};

			const getVariables = (matrix, index = 0) => {
				const firstCol = matrix.getCol(0);
				const firstAbsCol = firstCol.map(el => Math.abs(el));
				const maxAbsValIndex = firstAbsCol.indexOf(Math.max(...firstAbsCol));
				const maxAbsVal = firstCol[maxAbsValIndex];
				const factors = firstCol.map(el => el / maxAbsVal);
				const row = matrix.getRow(maxAbsValIndex);
				let newMatrix = matrix.clone.deleteCol(0);

				newMatrix.rows.forEach((_, rowIndex) => {
					rowIndex !== maxAbsValIndex && newMatrix.subtractRows(
						rowIndex, maxAbsValIndex, factors[rowIndex]
					);
				});

				newMatrix = newMatrix.deleteRow(maxAbsValIndex);

				const variable = this.variables[index];

				solution[variable] = row[row.length - 1];
				
				if (matrix.size.rows !== 1) {
					getVariables(newMatrix, index + 1);

					row.slice(1, row.length - 1).forEach((coefficient, currIndex) => {
						const currVariable = this.variables[index + 1 + currIndex];
						
						solution[variable] -= coefficient * solution[currVariable];
					});
				}

				solution[variable] /= maxAbsVal;
			}

			getVariables(this.augmentedMatrix);

			return solution;
		},

		luDecomposition: () => {
			const solution = {};
			const size = this.coefficientMatrix.size.rows;
			const lowerTriangularMatrix = new Matrix(size, size).fill(0);
			const upperTriangularMatrix = this.coefficientMatrix.clone;

			lowerTriangularMatrix.rows.forEach((row, rowIndex) => {
				row[rowIndex] = 1;
			});

			for (let i = 0; i < size - 1; i++) {
				for (let j = i + 1; j < size; j++) {
					const factor = upperTriangularMatrix.rows[j][i] 
						/ upperTriangularMatrix.rows[i][i];

					lowerTriangularMatrix.rows[j][i] = factor;
					upperTriangularMatrix.subtractRows(j, i, factor);
				}
			}

			const uxMatrix = new Matrix(size, 1).fill(0);

			uxMatrix.rows.forEach((row, rowIndex) => {
				const constTerm = this.constTerms[rowIndex];

				row[0] = constTerm - lowerTriangularMatrix.rows[rowIndex]
					.slice(0, rowIndex)
					.reduce((acc, currValue, currIndex) => {
						return acc + currValue * uxMatrix.rows[currIndex][0];
					}, 0);
			});

			const getVariables = (index = 0) => {
				const row = upperTriangularMatrix.getRow(index);
				const variable = this.variables[index];
				
				solution[variable] = uxMatrix.rows[index][0];

				if (index !== size - 1) {
					getVariables(index + 1);

					row.slice(index + 1, size).forEach((coefficient, currIndex) => {
						const currVariable = this.variables[index + 1 + currIndex];
						
						solution[variable] -= coefficient * solution[currVariable];
					});
				}

				solution[variable] /= row[index];
			}

			getVariables();

			return solution;
		},

		jacobi: (accuracy, matrixA, matrixB) => {
			const initialApproximationMatrix = matrixB.clone;

			function* getNextApproximation(prevApproximationMatrix) {
				const nextApproximationMatrix = matrixB.add(
					matrixA.multiply(prevApproximationMatrix)
				);

				const approxSolution = nextApproximationMatrix.rows
					.reduce((solution, row, index) => {
						solution[this.variables[index]] = row[0];

						return solution;
					}, {});

				yield approxSolution;

				const maxApproximationDiff = nextApproximationMatrix
					.subtract(prevApproximationMatrix)
					.map(Math.abs).max;

				if (maxApproximationDiff < accuracy) return;

				yield* getNextApproximation.call(this, nextApproximationMatrix);
			}
			
			return getNextApproximation.call(this, initialApproximationMatrix);
		},

		gaussSeidel: (accuracy, matrixA, matrixB) => {
			const prevApproxSolution = matrixB.rows
				.flat()
				.reduce((approxSolution, el, index) => {
					approxSolution[this.variables[index]] = el;

					return approxSolution;
				}, {});

			function *getNextApproximation(prevApproxSolution) {
				const n = this.variables.length;
				const approxSolution = {};

				for (let i = 0; i < n; i++) {
					const variable = this.variables[i];

					approxSolution[variable] = matrixB.get(i, 0);

					for (let j = 0; j < i; j++) {
						approxSolution[variable] += matrixA.get(i, j)
							* approxSolution[this.variables[j]];
					}

					for (let j = i + 1; j < n; j++) {
						approxSolution[variable] += matrixA.get(i, j)
							* prevApproxSolution[this.variables[j]];
					}
				}

				yield approxSolution;

				const approximationDiffs = [];

				this.variables.forEach(key => {
					approximationDiffs.push(
						approxSolution[key] - prevApproxSolution[key]
					);
				});

				const maxApproximationDiff = Math.max(
					...approximationDiffs.map(Math.abs)
				);

				if (maxApproximationDiff < accuracy) return;

				yield* getNextApproximation.call(this, approxSolution);
			}

			return getNextApproximation.call(this, prevApproxSolution);
		},
	};

	constructor(linearEquations) {
		const polynomRe = /((?:\+|\-)?\d+(?:\.\d+)?)([a-z])/g;

		this.coefficientMatrix = new Matrix(linearEquations.map(linearEquation => {
			return [...linearEquation.matchAll(polynomRe)].map(match => {
				return Number(match[1]);
			});
		}));

		this.variables = [...linearEquations[0].matchAll(polynomRe)].map(match => {
			return match[2];
		});

		this.constTerms = [...linearEquations.join(' ').matchAll(
			/=((?:\+|\-)?\d+(?:\.\d+)?)/g
		)].map(match => Number(match[1]));

		this.constTermMatrix = new Matrix([this.constTerms]).transpose;
		this.augmentedMatrix = this.coefficientMatrix.clone;
		this.augmentedMatrix.pushCol(this.constTerms);
	}

	solve(method = LinearSystem.methods.cramer) {
		switch (method) {
			case LinearSystem.methods.rows:
				return this.#methods.rows();
			case LinearSystem.methods.cramer:
				return this.#methods.cramer();
			case LinearSystem.methods.gaussianElimination:
				return this.#methods.gaussianElimination();
			case LinearSystem.methods.luDecomposition:
				return this.#methods.luDecomposition();
			default:
				console.error('No such method');
		}
	}

	solveIteratively(method = LinearSystem.methods.jacobi, accuracy = 0.001) {
		const matrixA = new Matrix(this.coefficientMatrix.rows
			.map((row, rowIndex) => {
				const diagonalEl = row[rowIndex];

				return row.map((el, colIndex) => {
					return rowIndex === colIndex ? 0 : -el / diagonalEl;
				});
			})
		);

		const converges = matrixA.map(Math.abs).rows.every(row => {
			const sum = row.reduce((acc, el) => acc + el);

			return sum < 1;
		});

		if (!converges) {
			console.error('The procedure does not converge');

			return;
		}

		const matrixB = new Matrix(this.constTermMatrix.rows
			.map((row, rowIndex) => {
				const diagonalEl = this.coefficientMatrix.rows[rowIndex][rowIndex];

				return row.map(el => el / diagonalEl);
			})	
		);

		switch (method) {
			case LinearSystem.methods.jacobi:
				return this.#methods.jacobi(accuracy, matrixA, matrixB);
			case LinearSystem.methods.gaussSeidel:
				return this.#methods.gaussSeidel(accuracy, matrixA, matrixB);
			default:
				console.error('No such iterative method');
		}
	}
}

export default LinearSystem;