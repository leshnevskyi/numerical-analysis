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

		newMatrix.matrix.forEach(row => {
			row[colIndex] = newCol[colIndex];
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
		}

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

			(function getFirstVariable(matrix) {

			})(this.augmentedMatrix);
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