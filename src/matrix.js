class Matrix {
	constructor(...args) {
		if (args[0] instanceof Array) {
			this.matrix = args[0];
		} else {
			let rowCount = args[0] ?? 1;
			let colCount = args[1] ?? 1;
			
			this.matrix = new Array(rowCount).fill(null).map(() => {
				const row = new Array(colCount).fill(null);

				return row;
			});
		}
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

			product.matrix.forEach((row, rowIndex) => {
				row.forEach((_, colIndex) => {
					const r = rowIndex;
					const c = colIndex;

					matrixB.matrix.forEach((_, i) => {
						product.matrix[r][c] += matrixA.matrix[r][i] * matrixB.matrix[i][c];
					});
				});
			});

			return product;
		});

		const numberProduct = numbers.reduce((acc, number) => acc *= number, 1);
		
		if (numberProduct && matrixProduct) {
			return new Matrix(matrixProduct.matrix.map(row => {
				return row.map(el => el * numberProduct);
			}));
		}

		return numberProduct ?? matrixProduct;
	}

	multiply(...factors) {
		return Matrix.multiply(this, ...factors);
	}

	getRow(rowIndex) {
		const row = [...this.matrix[rowIndex]];

		return row;
	}

	getCol(colIndex) {
		const col =  this.matrix.map(row => row[colIndex]);

		return col;
	}

	pushRow(...rows) {
		this.matrix.push(...rows);
	}

	pushCol(...cols) {
		this.matrix.forEach((row, index) => {
			row.push(...cols.map(col => col[index]));
		});
	}

	deleteRow(rowIndex) {
		const newMatrix = new Matrix(this.clone.matrix.filter((_, index) => {
			return index !== rowIndex;
		}));

		return newMatrix;
	}

	deleteCol(colIndex) {
		const newMatrix = new Matrix(this.clone.matrix.map(row => {
			return row.filter((_, index) => index !== colIndex);
		}));

		return newMatrix;
	}

	replaceRow(rowIndex, newRow) {
		const newMatrix = this.clone;

		newMatrix.matrix[rowIndex] = newRow;

		return newMatrix;
	}

	replaceCol(colIndex, newCol) {
		const newMatrix = this.clone;

		newMatrix.matrix.forEach((row, rowIndex) => {
			row[colIndex] = newCol[rowIndex];
		});

		return newMatrix;
	}

	swapRows(firstRowIndex, secondRowIndex) {
		const a = firstRowIndex;
		const b = secondRowIndex;
		const newMatrix = this.clone;

		[
			newMatrix.matrix[a], 
			newMatrix.matrix[b],
		] = [
			newMatrix.matrix[b], 
			newMatrix.matrix[a],
		];

		return newMatrix;
	}

	swapCols(firstColIndex, secondColIndex) {
		const a = firstColIndex;
		const b = secondColIndex;
		const newMatrix = this.clone;

		this.matrix.forEach(row => [row[a], row[b]] = [row[b], row[a]]);

		return newMatrix;
	}

	addRows(augendRowIndex, addendRowIndex, factor = 1) {
		this.matrix[addendRowIndex].forEach((el, colIndex) => {
			this.matrix[augendRowIndex][colIndex] += el * factor;
		});
	}

	addCols(augendColIndex, addendColIndex, factor = 1) {
		this.matrix.forEach(row => {
			row[augendColIndex] += row[addendColIndex] * factor;
		});
	}

	substractRows(minuendRowIndex, subtrahendRowIndex, factor = 1) {
		this.matrix[subtrahendRowIndex].forEach((el, colIndex) => {
			this.matrix[minuendRowIndex][colIndex] -= el * factor;
		});
	}

	substractCols(minuendColIndex, subtrahendColIndex, factor = 1) {
		this.matrix.forEach(row => {
			row[minuendColIndex] -= row[subtrahendColIndex] * factor;
		});
	}

	multiplyRow(rowIndex, factor) {
		this.matrix[rowIndex].forEach((_, colIndex) => {
			this.matrix[rowIndex][colIndex] *= factor;
		});
	}

	multiplyCol(colIndex, factor) {
		this.matrix.forEach(row => {
			row[colIndex] *= factor;
		});
	}

	getSubmatrix(rowIndex, colIndex) {
		const i = rowIndex;
		const j = colIndex;

		const submatrix = this.matrix
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
		const clonedMatrix = new Matrix(this.matrix.map(row => {
			return [...row.map(el => el)];
		}));

		return clonedMatrix;
	}

	get size() {
		const size = {
			rows: this.matrix.length,
			cols: this.matrix[0].length,
		};

		return size;
	}

	get transpose() {
		const transpose = new Matrix(this.matrix[0].map((_, colIndex) => {
			return this.matrix.map(row => row[colIndex]);
		}));

		return transpose;
	}

	get determinant() {
		if (!this.isSquare) {
			console.error(`Can't find the determinant of a non-square matrix`);

			return;
		}

		if (this.size.rows === 1) return this.matrix[0][0];

		const rowIndex = 0;

		const determinant = this.matrix[rowIndex].reduce((acc, el, colIndex) => {
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

		this.matrix.forEach((row, rowIndex) => {
			row.forEach((_, colIndex) => {
				const r = rowIndex;
				const c = colIndex;

				comatrix.matrix[r][c] = this.getCofactor(r, c);
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
		cramer: Symbol('cramer'),
		matrix: Symbol('matrix'),
		gaussianElimination: Symbol('gaussianElimination'),
	}

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
			const constTermsMatrix = this.constTermsMatrix;
			const solutionMatrix = inverseMatrix.multiply(constTermsMatrix);

			this.variables.forEach((variable, index) => {
				solution[variable] = solutionMatrix.matrix[index][0];
			});

			return solution;
		},

		gaussianElimination: () => {
			const solution = {};

			const getFirstVariable = (matrix, index) => {
				if (matrix.size.rows === 1) {
					const res = matrix.matrix[0][1] / matrix.matrix[0][0];
					const variable = this.variables[index];

					solution[variable] = res;

					return res;
				}

				const firstCol = matrix.getCol(0);
				const firstAbsCol = firstCol.map(el => Math.abs(el))
				const maxAbsValIndex = firstAbsCol.indexOf(Math.max(...firstAbsCol));
				const maxAbsVal = firstCol[maxAbsValIndex];
				const factors = firstCol.map(el => el / maxAbsVal);
				const row = matrix.getRow(maxAbsValIndex);
				let newMatrix = matrix.clone.deleteCol(0);

				newMatrix.matrix.forEach((_, rowIndex) => {
					rowIndex !== maxAbsValIndex && newMatrix.substractRows(
						rowIndex, maxAbsValIndex, factors[rowIndex]
					);
				});

				newMatrix = newMatrix.deleteRow(maxAbsValIndex);

				const variable = this.variables[index];

				solution[variable] = row[row.length - 1];
				solution[variable] -= row[1] * getFirstVariable(newMatrix, index + 1);

				row.slice(2, row.length - 1).forEach((coefficient, currIndex) => {
					const currVariable = this.variables[index + 2 + currIndex];
					
					solution[variable] -= coefficient * solution[currVariable];
				});

				solution[variable] /= maxAbsVal;

				return solution[variable];
			}

			getFirstVariable(this.augmentedMatrix, 0);

			return solution;
		},
	}

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
			/=(\d+(?:\.\d+)?)/g
		)].map(match => Number(match[1]));

		this.constTermsMatrix = new Matrix([this.constTerms]).transpose;
		this.augmentedMatrix = this.coefficientMatrix.clone;
		this.augmentedMatrix.pushCol(this.constTerms);
	}

	solve(method = LinearSystem.methods.cramer) {
		switch (method) {
			case LinearSystem.methods.matrix:
				return this.#methods.matrix();
			case LinearSystem.methods.cramer:
				return this.#methods.cramer();
			case LinearSystem.methods.gaussianElimination:
				return this.#methods.gaussianElimination();
			default:
				console.error('No such method');
		}
	}
}

const linearSystem = new LinearSystem([
	'1.24x-0.87y-3.17z=0.46',
	'2.11x-0.45y+1.44z=1.5',
	'0.48x+1.25y-0.63z=0.35',
]);

console.log(linearSystem.solve(LinearSystem.methods.cramer));
console.log(linearSystem.solve(LinearSystem.methods.matrix));
console.log(linearSystem.solve(LinearSystem.methods.gaussianElimination));