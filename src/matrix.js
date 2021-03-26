class Matrix {
	constructor(...args) {
		if (args[0] instanceof Array) {
			this.rows = args[0];
		} else {
			let rowCount = args[0] ?? 1;
			let colCount = args[1] ?? 1;
			
			this.rows = new Array(rowCount).fill(null).map(() => {
				const row = new Array(colCount).fill(null);

				return row;
			});
		}
	}

	static add(...matrices) {
		const firstMatrix = matrices[0];

		const areConformable = matrices.every(matrix => {
			return (
				firstMatrix.size.rows === matrix.size.rows
				&& firstMatrix.size.cols === matrix.size.cols
			);
		});

		if (!areConformable) {
			console.error(
				`Matrices are not conformable for addition and subtraction`
			);

			return;
		}

		const sumMatrix = matrices.reduce((sumMatrix, currMatrix) => {
			return sumMatrix.map((el, rowIndex, colIndex) => {
				return el + currMatrix.rows[rowIndex][colIndex];
			});
		}, new Matrix(firstMatrix.size.rows, firstMatrix.size.cols));

		return sumMatrix;
	}

	static subtract(...matrices) {
		const minuendMatrix = matrices[0];

		const subtrahendMatrices = matrices.slice(1).map(matrix => {
			return matrix.multiply(-1);
		});

		const diffMatrix = Matrix.add(minuendMatrix, ...subtrahendMatrices);

		return diffMatrix;
	}

	static multiply(...factors) {
		const matrices = [...factors.filter(factor => factor instanceof Matrix)];
		const numbers = [...factors.filter(factor => !isNaN(factor))];

		const matrixProduct = matrices.length && matrices.reduce((acc, matrix) => {
			const matrixA = acc;
			const matrixB = matrix;

			if (matrixA.size.cols !== matrixB.size.rows) {
				throw new Error(
					'Cannot multiply the matrices. The number of columns in the first matrix must be equal to the number of rows in the second matrix'
				);
			}

			const product = new Matrix(matrixA.size.rows, matrixB.size.cols);

			product.rows.forEach((row, rowIndex) => {
				row.forEach((_, colIndex) => {
					const r = rowIndex;
					const c = colIndex;

					matrixB.rows.forEach((_, i) => {
						product.rows[r][c] += matrixA.rows[r][i] * matrixB.rows[i][c];
					});
				});
			});

			return product;
		});

		const numberProduct = numbers.reduce((acc, number) => acc *= number, 1);
		
		if (numberProduct && matrixProduct) {
			return new Matrix(matrixProduct.rows.map(row => {
				return row.map(el => el * numberProduct);
			}));
		}

		return numberProduct ?? matrixProduct;
	}

	get(i, j) {
		const el = this.rows[i][j];

		return el;
	}

	map(callback, thisArg = this) {
		const newMatrix = new Matrix(this.rows.map((row, rowIndex) => {
			return row.map((el, colIndex) => {
				return callback(el, rowIndex, colIndex);
			}, thisArg);
		}));

		return newMatrix;
	}

	fill(value) {
		const newMatrix = this.clone;

		newMatrix.rows.forEach(row => {
			row = row.fill(value);
		});

		return newMatrix;
	}

	add(...matrices) {
		return Matrix.add(this, ...matrices);
	}

	subtract(...matrices) {
		return Matrix.subtract(this, ...matrices);
	}

	multiply(...factors) {
		return Matrix.multiply(this, ...factors);
	}

	getRow(rowIndex) {
		const row = [...this.rows[rowIndex]];

		return row;
	}

	getCol(colIndex) {
		const col = this.rows.map(row => row[colIndex]);

		return col;
	}

	pushRow(...rows) {
		this.rows.push(...rows);
	}

	pushCol(...cols) {
		this.rows.forEach((row, index) => {
			row.push(...cols.map(col => col[index]));
		});
	}

	deleteRow(rowIndex) {
		const newMatrix = new Matrix(this.clone.rows.filter((_, index) => {
			return index !== rowIndex;
		}));

		return newMatrix;
	}

	deleteCol(colIndex) {
		const newMatrix = new Matrix(this.clone.rows.map(row => {
			return row.filter((_, index) => index !== colIndex);
		}));

		return newMatrix;
	}

	replaceRow(rowIndex, newRow) {
		const newMatrix = this.clone;

		newMatrix.rows[rowIndex] = newRow;

		return newMatrix;
	}

	replaceCol(colIndex, newCol) {
		const newMatrix = this.clone;

		newMatrix.rows.forEach((row, rowIndex) => {
			row[colIndex] = newCol[rowIndex];
		});

		return newMatrix;
	}

	swapRows(firstRowIndex, secondRowIndex) {
		const a = firstRowIndex;
		const b = secondRowIndex;
		const newMatrix = this.clone;

		[
			newMatrix.rows[a], 
			newMatrix.rows[b],
		] = [
			newMatrix.rows[b], 
			newMatrix.rows[a],
		];

		return newMatrix;
	}

	swapCols(firstColIndex, secondColIndex) {
		const a = firstColIndex;
		const b = secondColIndex;
		const newMatrix = this.clone;

		this.rows.forEach(row => [row[a], row[b]] = [row[b], row[a]]);

		return newMatrix;
	}

	addRows(augendRowIndex, addendRowIndex, factor = 1) {
		this.rows[addendRowIndex].forEach((el, colIndex) => {
			this.rows[augendRowIndex][colIndex] += el * factor;
		});
	}

	addCols(augendColIndex, addendColIndex, factor = 1) {
		this.rows.forEach(row => {
			row[augendColIndex] += row[addendColIndex] * factor;
		});
	}

	subtractRows(minuendRowIndex, subtrahendRowIndex, factor = 1) {
		this.rows[subtrahendRowIndex].forEach((el, colIndex) => {
			this.rows[minuendRowIndex][colIndex] -= el * factor;
		});
	}

	subtractCols(minuendColIndex, subtrahendColIndex, factor = 1) {
		this.rows.forEach(row => {
			row[minuendColIndex] -= row[subtrahendColIndex] * factor;
		});
	}

	multiplyRow(rowIndex, factor) {
		this.rows[rowIndex].forEach((_, colIndex) => {
			this.rows[rowIndex][colIndex] *= factor;
		});
	}

	multiplyCol(colIndex, factor) {
		this.rows.forEach(row => {
			row[colIndex] *= factor;
		});
	}

	getSubmatrix(rowIndex, colIndex) {
		const i = rowIndex;
		const j = colIndex;

		const submatrix = this.rows
			.filter((_, rowIndex) => rowIndex !== i)
			.map(row => row.filter((_, colIndex) => colIndex !== j));

		return new Matrix(submatrix);
	}

	getMinor(rowIndex, colIndex) {
		const submatrix = this.getSubmatrix(rowIndex, colIndex);
		const minor = submatrix.determinant;

		return minor;
	}

	getCofactor(rowIndex, colIndex) {
		const minor = this.getMinor(rowIndex, colIndex);
		const cofactor = (-1) ** (rowIndex + colIndex) * minor;

		return cofactor;
	}

	get clone() {
		const clonedMatrix = new Matrix(this.rows.map(row => {
			return [...row.map(el => el)];
		}));

		return clonedMatrix;
	}

	get size() {
		const size = {
			rows: this.rows.length,
			cols: this.rows[0].length,
		};

		return size;
	}

	get elements() {
		const elements = this.rows.flat();

		return elements;
	}

	get min() {
		const minEl = Math.min(...this.elements);

		return minEl;
	}

	get max() {
		const maxEl = Math.max(...this.elements);

		return maxEl;
	}

	get transpose() {
		const transpose = new Matrix(this.rows[0].map((_, colIndex) => {
			return this.rows.map(row => row[colIndex]);
		}));

		return transpose;
	}

	get determinant() {
		if (!this.isSquare) {
			console.error(`Can't find the determinant of a non-square matrix`);

			return;
		}

		if (this.size.rows === 1) return this.rows[0][0];

		const rowIndex = 0;

		const determinant = this.rows[rowIndex].reduce((acc, el, colIndex) => {
			const cofactor = this.getCofactor(rowIndex, colIndex);

			return acc += el * cofactor;
		}, 0);

		return determinant; 
	}

	get isSquare() {
		return this.size.rows === this.size.cols;
	}

	get isInvertible() {
		return this.determinant && this.isSquare;
	}

	get comatrix() {
		const comatrix = new Matrix(this.size.rows, this.size.cols);

		this.rows.forEach((row, rowIndex) => {
			row.forEach((_, colIndex) => {
				const r = rowIndex;
				const c = colIndex;

				comatrix.rows[r][c] = this.getCofactor(r, c);
			});
		});

		return comatrix;
	}

	get adjugate() {
		return this.comatrix.transpose;
	}

	get inverse() {
		if (!this.isInvertible) {
			console.error('The matrix is singular');

			return;
		}

		const determinant = this.determinant;
		const inverse = this.adjugate.multiply(1 / determinant);

		return inverse;
	}
}

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

const linearSystem = new LinearSystem([
	'1.13x+0.27y-0.22z-0.18w=-1.21',
	'-0.21x-0.65y+0.18z-0.18w=-0.33',
	'0.12x+0.13y-0.73z+0.18w=0.48',
	'0.33x-0.05y+0.06z-1.28w=-0.17',
]);