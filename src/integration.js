class Interval {
	constructor(endpoints) {
		endpoints[0] <= endpoints[1]
			? ([
					this.lowerEndpoint, 
					this.upperEndpoint
				] = [endpoints[0], endpoints[1]])
			: ([
					this.lowerEndpoint, 
					this.upperEndpoint
				] = [endpoints[1], endpoints[0]]);
	}
}

class Integral {
	constructor(integrand, interval) {
		this.integrand = integrand;
		this.interval = interval;

		console.log(`h=${
			((interval.upperEndpoint - interval.lowerEndpoint) / 10).toFixed(3)
		}`);
	}

	#integrationMethods = {
		// Метод лівих прямокутників
		leftRiemannSum: subintervalCount => {
			const upperLimit = this.interval.upperEndpoint;
			const lowerLimit = this.interval.lowerEndpoint;
			const subintervalLength = (upperLimit - lowerLimit) / subintervalCount;
			const dataset = [];

			for (let i = 0; i <= subintervalCount - 1; i++) {
				const x = lowerLimit + subintervalLength * i;
				const y = this.integrand(x);
				const point = {x, y};

				dataset.push(point);
			}

			const solution = dataset.reduce((sum, point) => {
				return sum + subintervalLength * point.y;
			}, 0);

			// Обчислення похибки
			const error = this.integrand.derivative('x', 2).maxima
				/ 24 * (upperLimit - lowerLimit) * subintervalCount ** 2;

			return solution;
		},

		// Метод правих прямокутників
		rightRiemannSum: subintervalCount => {
			const upperLimit = this.interval.upperEndpoint;
			const lowerLimit = this.interval.lowerEndpoint;
			const subintervalLength = (upperLimit - lowerLimit) / subintervalCount;
			const dataset = [];

			for (let i = 1; i <= subintervalCount; i++) {
				const x = lowerLimit + subintervalLength * i;
				const y = this.integrand(x);
				const point = {x, y};

				dataset.push(point);
			}

			const solution = dataset.reduce((sum, point) => {
				return sum + subintervalLength * point.y;
			}, 0);

			return solution;
		},

		// Метод середніх прямокутників
		middleRiemannSum: subintervalCount => {
			const upperLimit = this.interval.upperEndpoint;
			const lowerLimit = this.interval.lowerEndpoint;
			const subintervalLength = (upperLimit - lowerLimit) / subintervalCount;
			const dataset = [];

			for (let i = 0; i <= subintervalCount - 1; i++) {
				const x = lowerLimit + subintervalLength * i;
				const y = this.integrand(x);
				const point = {x, y};

				dataset.push(point);
			}

			const solution = dataset.reduce((sum, point) => {
				const funcOutput = this.integrand(point.x + subintervalLength / 2);

				return sum + subintervalLength * funcOutput;
			}, 0);

			return solution;
		},

		// Метод трапецій
		trapezoidalRule: subintervalCount => {
			const upperLimit = this.interval.upperEndpoint;
			const lowerLimit = this.interval.lowerEndpoint;
			const subintervalLength = (upperLimit - lowerLimit) / subintervalCount;
			const dataset = [];

			function getArgumentByIndex(index) {
				return lowerLimit + subintervalLength * index;
			}

			let solution = 0;

			for (let i = 0; i <= subintervalCount - 1; i++) {
				solution += subintervalLength * (
					this.integrand(getArgumentByIndex(i))
					+ this.integrand(getArgumentByIndex(i + 1))
				) / 2;
			}

			// Обчислення похибки
			const error = -this.integrand.derivative('x', 2) 
			/ 12 * (upperLimit - lowerLimit) * subintervalCount ** 2;

			return solution;
		},

		// Метод Сімпсона
		simpsonsRule: subintervalCount => {
			const upperLimit = this.interval.upperEndpoint;
			const lowerLimit = this.interval.lowerEndpoint;
			const subintervalLength = (upperLimit - lowerLimit) / subintervalCount;

			function getArgumentByIndex(index) {
				return lowerLimit + subintervalLength * index;
			}

			let sum = 
				+ this.integrand(getArgumentByIndex(0))
				+ this.integrand(getArgumentByIndex(2 * subintervalCount));

			for (let i = 1; i <= subintervalCount / 2; i++) {
				sum += 4 * this.integrand(getArgumentByIndex(2 * i - 1));
			}

			for (let i = 1; i <= subintervalCount / 2 - 1; i++) {
				sum += 2 * this.integrand(getArgumentByIndex(2 * i));
			}

			const solution = subintervalLength / 3 * sum;

			// Обчислення похибки
			const error = -this.integrand.derivative('x', 4).maxima
				/ 180 * (upperLimit - lowerLimit) ** 5 / subintervalCount;

			return solution;
		},
	};
	
	solve(method = 'simpsonsRule', subintervalCount = 100) {
		return this.#integrationMethods[method](subintervalCount);
	}
};

export {Interval};
export default Integral;