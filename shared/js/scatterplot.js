import * as d3 from 'd3'
import * as delaunay from 'd3-delaunay'
import textures from 'textures'
import Linechart from './linechart'
import { numberWithCommas } from 'shared/js/util'

let xScale = d3.scaleLinear()

let yScale = d3.scaleLinear()

let radius = d3.scaleSqrt()
.range([1, 15])

let data_ = null;
let capsExtent_ = null;
let dropsExtent_ = null;
let overallExtent_ = null;

let svg_ = null;
let width_ = null;
let height_ = null;

let tooltipClass_ = null;
let atomEl_ = null;

const parseTime = d3.timeParse("%Y-%m-%d");

let dateFormat = d3.timeFormat("%d %b");

//let decimal = d3.format(",.2f")

let tooltipSvg;

let divisionLine;


class Scatterplot {

	constructor(svg, width, height, data, capsExtent, dropsExtent, overallExtent, tooltipClass, atomEl, marketIniMin) {


		svg_ = svg;
		width_ = width;
		height_=height;

		data_ = data;

		capsExtent_ = capsExtent;
		dropsExtent_ = dropsExtent;
		overallExtent_ = overallExtent;


		tooltipClass_ = tooltipClass;
		atomEl_ = atomEl;

		xScale.range([20, width_-20])

		yScale.range([height_ -20, 40])

		radius.domain(capsExtent_);

		xScale.domain(dropsExtent_)

		yScale.domain(overallExtent_)

		divisionLine = ((marketIniMin.min - marketIniMin.ini) / marketIniMin.ini) * 100;

		let yaxis = svg_.append("g")
		.attr("class", "yaxis")
		.call(
			d3.axisLeft(yScale)
			.ticks(5)
			.tickSizeInner(-width_)
			)
		.selectAll("text")
		.style("text-anchor", "start")
		.attr('x', 10)
		.attr('y', -10);

		d3.select(".yaxis .domain").remove();

		let tickPos = null

		svg_.selectAll('.yaxis text').nodes().map( (t,i) => {

			if(t.innerHTML == '0')  tickPos = i

		})

		let lineNode = svg_.selectAll('.yaxis line').nodes()[tickPos];
		let zeroNode = svg_.selectAll('.yaxis text').nodes()[tickPos];

		zeroNode.innerHTML = '0% change since 2 Jan'

		d3.select(lineNode).style('stroke', '#333333')
		d3.select(zeroNode).style('fill', '#333333')

		let arrowX = d3.select('#' + atomEl_.parentNode.parentNode.parentNode.id + ' .scroll-inner')
		.append('div')
		.attr('class', 'arrow-container-xaxis')

		let arrowLeft = arrowX
		.append('div')
		.attr('class', 'arrow-container-xaxis-left');

		let arrowRight = arrowX
		.append('div')
		.attr('class', 'arrow-container-xaxis-right');

		arrowLeft
		.append('p')
		.attr('class','text2')
		.html('Highest price drop')

		arrowLeft
		.append('div')
		.attr('class','arrow2')
		.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
			viewBox="0 0 24.9px 5px" width="25px" height="5px" style="enable-background:new 0 0 24.9 5;" xml:space="preserve">
			<polygon points="0,2.5 4.3,5 4.3,3 24.9,3 24.9,2 4.3,2 4.3,0 "/>
			</svg>`)

		arrowRight
		.append('div')
		.attr('class','arrow')
		.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
			viewBox="0 0 24.9px 5px" width="24.9px" height="5px" style="enable-background:new 0 0 24.9 5;" xml:space="preserve">
			<polygon points="24.9,2.5 20.6,0 20.6,2 0,2 0,3 20.6,3 20.6,5 "/>
			</svg>`)

		arrowRight
		.append('p')
		.attr('class','text')
		.html('Lowest price drop')

		let g = svg_.append('g')

		let texture = textures.lines()
		.size(4)
		.stroke("#333333")
		.strokeWidth(1);

		svg_.call(texture)

		let points =[];

		data_.map(c => {


			if(!isNaN(c.drop) && !isNaN(c.overall))
			{
				let symbol = c.symbol.indexOf('.') != -1 ? c.symbol.replace('.', '-') : c.symbol

				let circle = g
				.append('circle')
				.attr('class', 'company s' + symbol)
				.attr('r', 0)
				.attr('cx', xScale(c.drop))
				.attr('cy', yScale(c.overall))
				.attr('fill', texture.url())
				.on('mouseover', d => manageOver('s' + symbol, c.name, c.overall, c.drop))
				.on('mouseout', d => manageOut('s' + symbol))
				.on('mousemove', d => manageMove())

				circle
				.transition()
				.duration(200)
				.attr('r',radius(c.cap))

			}
		})

		let xaxis = svg_.append("g")
		.attr("transform", "translate(0," + (height_) + ")")
		.attr("class", "xaxis")
		.call(
			d3.axisBottom(xScale)
			.ticks(0)
			)
		.selectAll("text")
		.attr('y', 10);

	}


	reset(){

		svg_.selectAll('.division').remove()

		svg_.selectAll('.highlighted-text' ).remove()

		svg_.selectAll('circle' ).classed('winner', false)

		for (var i = 1; i <= 10; i++) {
			svg_
			.selectAll('circle')
			.classed('highlight-' + i, false)
		}
	}


	division(){

		svg_.selectAll('.division').remove()

		let posX = xScale(divisionLine)

		svg_
		.append('line')
		.attr('class', 'division')
		.attr('x1', posX)
		.attr('y1', 0)
		.attr('x2', posX)
		.attr('y2', height_)

	}

	winnersLosers(){


		data_.map(c => {

			let symbol = c.symbol.indexOf('.') != -1 ? c.symbol.replace('.', '-') : c.symbol

			let className = c.drop > divisionLine ? 'winner' : 'loser'

			let circle = svg_
			.select('.s' + symbol)
			.classed(className, true)


		})

	}

	highlight(symbol, oneToTen){

		d3.select('.company.s' + symbol)
		.classed(' highlight-' + oneToTen, true)

	}
}



const manageOver = (symbol, name, overall, drop) => {

	let className = drop > divisionLine ? 'winner' : 'loser'

	let company = data_.find(f => f.symbol.replace('.', '-') === symbol.split('s')[1])

	d3.select('.' + tooltipClass_ + ' div').remove()

	let tooltipWrapper = d3.select('.' + tooltipClass_).append('div')

	let header = tooltipWrapper
	.html('<b>' + name + '</b>')

	d3.select('.' + tooltipClass_ + ' svg').remove()

	let iniEndWrapper = tooltipWrapper
    .append('div')
    .attr('class', 'current-wrapper')

	let iniWrapper = iniEndWrapper
    .append('div')
    .attr('class', 'ini-wrapper')

	let iniDate = iniWrapper.append('p')
    .attr('class', 'ini-text')
    .html(dateFormat(parseTime(company.inidate)))

	let iniN = (+company.ini).toFixed(1)
	let minN = (+company.min).toFixed(1)
	let endN = (+company.end).toFixed(1)

    let ini = iniWrapper.append('p')
    .attr('class', 'ini-text')
    .html('<b>' + numberWithCommas(iniN).replace('.0', '') + '</b>')

    let endWrapper = iniEndWrapper.append('div')

    let endDate = endWrapper.append('p')
    .attr('class', 'end-text')
    .html(dateFormat(parseTime(company.enddate)))

    let end = endWrapper.append('p')
    .attr('class', 'end-text')
    .html('<b>' + numberWithCommas(endN).replace('.0', '') + '</b>')

	let tSvg = tooltipWrapper.append("svg")
	.attr("width", 140)
	.attr("height", 70)
	
	let lc = new Linechart(140, 70, tSvg, company, className)

	className == 'winner' ? lc.makeiniline() : lc.makeriseline()
	
	d3.select('.' + tooltipClass_).classed(' over', true)
	svg_.select('.' + symbol).classed(' over', true)

	let minWrapper = tooltipWrapper
    .append('div')
    .attr('class', 'min-wrapper')

    let minDate = minWrapper.append('p')
    .attr('class', 'end-text')
    .html(dateFormat(parseTime(company.mindate)))
    .style('margin-left', -minWrapper.node().getBoundingClientRect().x + tSvg.select('.drop-dot').node().getBoundingClientRect().x + 'px')

    let min = minWrapper.append('p')
    .attr('class', 'min-text')
    .html('<b>' + numberWithCommas(minN).replace('.0', '') + '</b>')
    .style('margin-left', -minWrapper.node().getBoundingClientRect().x + tSvg.select('.drop-dot').node().getBoundingClientRect().x + 'px')

  }


  const manageOut = (symbol) => {
  	d3.select('.' + tooltipClass_).classed(' over', false)
  	svg_.select('.' + symbol).classed('over', false)
  }

  const manageMove = () => {

  	let here = d3.mouse(atomEl_)

  	let left = here[0];
  	let top = here[1];

  	let tHeight = d3.select('.' + tooltipClass_).node().getBoundingClientRect().height;
  	let tWidth = d3.select('.' + tooltipClass_).node().getBoundingClientRect().width;

  	let posX = left > width_ / 2 ? (left - tWidth - 5) : (left  + 5)
  	let posY = top > height_ / 2 ? (top - tHeight - 5) : (top  + 5)

  	posX < 0 ? posX = 0 : posX
  	posY < 0 ? posY = 0 : posY

  	d3.select('.' + tooltipClass_).style('left',  posX + 'px')
  	d3.select('.' + tooltipClass_).style('top', posY + 'px')


  }

  export default Scatterplot