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

	toArray() {
		const array = this.rows.flat();

		return array;
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

export default Matrix;