let call = 0,
	getPrefix = (isTitle) => {
		if (typeof isTitle === 'boolean') {
			return isTitle ? '\n' + ++call + ') ' : '⟼   ';
		} 
		else return isTitle;
	},
	info = (...args) => {
		args[0] = getPrefix(args[0]);
		console.info(...args);
	},
	log = (...args) => {
		args[0] = getPrefix(args[0]);
		console.log(...args);
	},
	trace = (...args) => {
		args[0] = getPrefix(args[0]);
		console.trace(...args);
	},
	warn = (...args) => {
		args[0] = getPrefix(args[0]);
		console.warn(...args);
	},
	error = (...args) => {
		args[0] = getPrefix(args[0]);
		console.error(...args);
	},
	stdout = (...args) => {
		process.stdout.write(...args);
	},
	clear = () => {
		console.clear();
	};

module.exports = {info, log, trace, warn, error, stdout, clear};