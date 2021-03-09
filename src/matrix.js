class Matrix {
  constructor(matrix = [[]]) {
    this.matrix = matrix;
  }

  replaceRow(rowIndex, newRow) {
    let newMatrix = new Matrix(this.matrix);

    newMatrix.matrix[rowIndex] = newRow;

    return newMatrix;
  }

  replaceCol(colIndex, newCol) {
    const newMatrix = new Matrix(this.matrix.map(([...row], rowIndex) => {
      row[colIndex] = newCol[rowIndex];

      return row;
    }));

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

  get size() {
    const size = {
      rows: this.matrix.length,
      cols: this.matrix[0].length,
    }

    return size;
  }

  get determinant() {
    if (this.size.rows !== this.size.cols) {
      console.warn(`Can't find the determinant of a non-square matrix`);

      return;
    }

    if (this.size.rows === 1) return this.matrix[0][0];

    const rowIndex = 0;

    const determinant = this.matrix[rowIndex].reduce((acc, el, colIndex) => {
      const submatrix = this.getSubmatrix(rowIndex, colIndex);

      return acc += (-1) ** colIndex * el * submatrix.determinant;
    }, 0);

    return determinant; 
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
  }

  solve(method = LinearSystem.methods.matrix) {
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

console.log(linearSystem.solve());