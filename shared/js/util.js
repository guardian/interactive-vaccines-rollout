const $ = selector => document.querySelector(selector)
const $$ = selector => [].slice.apply(document.querySelectorAll(selector))

// rounds value to exp digits (can be a negative number -> eg round(1234, -3) === 1000)

const round = (value, exp) => {
	if (typeof exp === 'undefined' || +exp === 0)
		return Math.round(value);

	value = +value;
	exp = +exp;

	if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
		return NaN;

	value = value.toString().split('e');
	value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

	value = value.toString().split('e');
	return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

// inserts UK-style commas in numbers (1,300,000)

const numberWithCommas = x => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// returns a Promise that resolves after ms milliseconds

const wait = ms => new Promise((resolve, reject) => setTimeout(() => resolve(), ms ))

const getDimensions = el => {
	const width = el.clientWidth || el.getBoundingClientRect().width
	const height = el.clientHeight || el.getBoundingClientRect().height
	return [ width, height ]
}

const hashPattern = (patternId, pathClass, rectClass, a = 4) => {

	return `
		<pattern id='${patternId}' patternUnits='userSpaceOnUse' width='${a}' height='${a}'>
			<rect width='${a}' height='${a}' class='${rectClass}'></rect>
			<path d='M-1,1 l2,-2 M0,${a} l${a},-${a} M${a-1},${a+1} l2,-2' class='${pathClass}'></path>
		</pattern>
	`

}

function ordinal(i) {

	if(i === 1) { return 'first' }
	if(i === 2) { return 'second' }
	if(i === 3) { return 'third' }

    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

const sum = (a, b) => a + b

// duplicates a DOM element, inserts BEFORE original and adds a class name without deleting the old one.
// Great for adding white outlines to SVG text elements

const duplicate = ( el, className ) => {

	const clone = el.cloneNode(true)
	clone.classList.add(className)
	el.parentNode.insertBefore(clone, el)

}

// sequentially executes the (Promise-based) tasks in arr

const pseq = (arr, lambda) => {

	return arr.reduce( (agg, cur, i, arr) => {

		return agg.then(res => lambda(cur, i, arr).then( res2 => res.concat(res2)))

	}, Promise.resolve([]) )

}

const featureTest = (property, value, noPrefixes) => {
    var prop = property + ':',
        el = document.createElement('test'),
        mStyle = el.style;

    if (!noPrefixes) {
        mStyle.cssText = prop + ['-webkit-', '-moz-', '-ms-', '-o-', ''].join(value + ';' + prop) + value + ';';
    } else {
        mStyle.cssText = prop + value;
    }
    return mStyle[property];
}

const supportsSticky = () => (featureTest('position', 'sticky') || featureTest('position', '-webkit-sticky'))

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

const describeArc = (x, y, radius, startAngle, endAngle)  => {

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}



export { $, $$, round, numberWithCommas, wait, getDimensions, hashPattern, duplicate, pseq, sum, ordinal, featureTest, supportsSticky, describeArc }