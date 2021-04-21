import * as d3 from 'd3'
import moment from 'moment'
import { numberWithCommas } from 'shared/js/util'



const parseTime = d3.timeParse("%Y-%m-%d");

const xScale = d3.scaleTime()
.domain([parseTime('2020-01-01'),parseTime(moment().format('YYYY-MM-DD'))])

const yScale = d3.scaleLinear()

let line = d3.line()
.x(d => xScale(parseTime(d.date)))
.y(d => yScale(d.value))

let svg_ = null;
let width_ = null;
let height_ = null;
let data_ = null;

let decimal = d3.format(",.1f")

class Linechart {

	constructor(width, height, svg, data, winnerOrLoser) {

	svg_ = svg;
	width_ = width;
	height_= height;
	xScale.range([5, width_ - 5]);
	yScale.range([height_ - 5, 5]);
	yScale.domain([data.min,data.max]);
    data_ = data;

	const companyLine = svg_
        .append('path')
        .datum([{date:'2020-01-01',value:+data.ini}, {date:data.mindate,value:+data.min},{date:data.mindate,value:data.min},{date:moment().format('YYYY-MM-DD'),value:data.end}])
        .attr('d', line)
        .attr('class','line-' + winnerOrLoser)

        const iniDot = svg_
        .append('circle')
        .attr('r', 3)
        .attr('cx', xScale(parseTime('2020-01-01')))
        .attr('cy', yScale(data.ini))
        .attr('class','dot-' + winnerOrLoser)


        const dropDot = svg_
        .append('circle')
        .attr('r', 3)
        .attr('cx', xScale(parseTime(data.mindate)))
        .attr('cy', yScale(data.min))
        .attr('class','dot-' + winnerOrLoser + ' drop-dot')

        const riseDot = svg_
        .append('circle')
        .attr('r', 3)
        .attr('cx', xScale(parseTime(moment().format('YYYY-MM-DD'))))
        .attr('cy', yScale(data.end))
        .attr('class','dot-' + winnerOrLoser)

	}


        makeiniline(){
                const iniLine = svg_
                .append('line')
                .attr('class', 'chart-line')
                .attr('x1', xScale(parseTime(moment().format('2020-01-01'))))
                .attr('x2', xScale(parseTime(moment().format('2020-01-01'))))
                .attr('y1', yScale(data_.ini))
                .attr('y2', 5)
        }

        makeriseline(){
                 const riseLine = svg_
                .append('line')
                .attr('class', 'chart-line')
                .attr('x1', xScale(parseTime(moment().format('YYYY-MM-DD'))))
                .attr('x2', xScale(parseTime(moment().format('YYYY-MM-DD'))))
                .attr('y1', yScale(data_.end))
                .attr('y2', 5)

        }

        makedropline(){

                const dropLine = svg_
                .append('line')
                .attr('class', 'chart-line')
                .attr('x1', xScale(parseTime(data_.mindate)))
                .attr('x2', xScale(parseTime(data_.mindate)))
                .attr('y1', yScale(data_.min))
                .attr('y2', height_)
        }
}

export default Linechart