import * as d3 from 'd3'
import ScrollyTeller from "shared/js/scrollyteller"
import dataRaw from 'assets/all.json'
import { numberWithCommas, describeArc } from 'shared/js/util'
import * as moment from 'moment'

var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

console.log(isSafari)

const data = dataRaw.sort((a,b) => +b.population - +a.population)//.filter(d => +d.vaccine_rate != 0 && +d.deaths_rate != 0 && +d.deaths_rate <= 300)

const dataAlphabetical = data.filter(d => d.country != 'Qatar')

dataAlphabetical.sort((a,b) => {
        if(a.country < b.country) return -1 
        if(a.country > b.country) return 1
        return 0
})

const maxDeathRate = d3.max(data, d => +d.deaths_rate);

let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.scroll-inner').node();

let width = atomEl.getBoundingClientRect().width;
let height =  isMobile ? window.innerHeight / 2 : 90 * window.innerHeight / 100;

let svg = d3.select('#gv-scrolly-1 .scatterplot-container').append("svg")
.attr('class', 'gv-scatterplot-1')
.attr("width", width)
.attr("height", height)

let axis = svg.append('g')
let annotationGreen = svg.append('g')
let blobs = svg.append('g')
let annotations = svg.append('g')
let tooltipFurniture = svg.append('g').attr('class','tooltip-furniture')

const defs = svg.append("defs");

const dropShadowFilter = defs.append('svg:filter')
.attr('id', 'drop-shadow')
.append('svg:feDropShadow')
.attr('dx', 0)
.attr('dy', 0)
.attr('stdDeviation', 1)
.attr('flood-color', '#333')

let xScale = d3.scaleLinear()
.range([40, width])
.domain([0,200]);

const parseTime = d3.timeParse("%m/%d/%y");
//2/15/21

let yScale = d3.scaleLinear()
.range([height, 25])
.domain([-100, maxDeathRate]);

let radius = d3.scaleSqrt()
.range([1, 25])
.domain(d3.extent(data, d => +d.population));

let xLine = d3.scaleTime()
.range([25, isMobile ? width - 60 : 160])

let yLine = d3.scaleLinear()

let greenArea = axis.append('rect')
.attr('width', xScale(xScale.domain()[1] - 50) - 40 + 'px')
.attr('height', yScale(maxDeathRate - 100) - 20+ 'px')
.attr('x', xScale(50) + 'px')
.attr('y', yScale(0) + 'px')
.attr('class', 'green-area')

let yaxis = axis.append("g")
.attr("class", "yaxis")
.call(
    d3.axisLeft(yScale)
    .ticks(10)
    .tickSizeInner(-width)
    )
.selectAll("text")
.attr('y', -10);

let tickPos = null
d3.selectAll('.yaxis text').nodes().map( (t,i) => {

  if(t.innerHTML == '0')  tickPos = i

})

let lineNode = d3.selectAll('.yaxis line').nodes()[tickPos];
let zeroNode = d3.selectAll('.yaxis text').nodes()[tickPos];

d3.select(lineNode).attr('class', 'gv-zero-line')
d3.select(zeroNode).attr('class', 'gv-zero-text')

let xaxis = axis.append("g")
.attr("transform", "translate(0," + height + ")")
.attr("class", "xaxis")
.call(
    d3.axisBottom(xScale)
    .ticks(5)
    )
.selectAll("text")
.attr('y', 10);

d3.select(".xaxis .domain").remove();

let circles = blobs.selectAll('blah')
.data(data)
.enter()
.append('circle')
.attr('class', d => 'sc-unselected ' + d.code)
.attr('cx', d => xScale(+d.vaccine_rate))
.attr('cy', d => yScale(+d.deaths_rate))
.attr('r', d => radius(+d.population))
/*.style("filter", "url(#drop-shadow)")*/
.on('mouseover', (event,d) => {

    if(!isMobile){
        svg.selectAll('circle').style("stroke-width", 1);
        svg.selectAll('circle').style("stroke", '#ffffff');
        makeTooltip(d,{x:+d3.select('.' + d.code).node().attributes.cx.value, y:+d3.select('.' + d.code).node().attributes.cy.value}, radius(+d.population))
    }

})
.on('mouseout', event => {

    tooltipFurniture.selectAll('path').remove()
    tooltipFurniture.selectAll('polyline').remove()

    d3.select('.gv-tooltip-container')
    .classed('over', false)
    //.style('left', '2000px')

    d3.select(event.currentTarget).style("stroke-width", 1);
    d3.select(event.currentTarget).style("stroke", '#ffffff');
})



const scrolly = new ScrollyTeller({
    parent: document.querySelector("#gv-scrolly-1"),
        triggerTop: .5, // percentage from the top of the screen that the trigger should fire
        triggerTopMobile: 0.75,
        transparentUntilActive: true
    });

scrolly.addTrigger({num: 1, do: () => {

    clearAnnotations()

    //makeAnnotation('QAT','Qatar has seen an increase in deaths recently - although total deaths remain low', 'right', 120, 20, -5)

    resetYaxis(maxDeathRate);
    
    blobs.selectAll('circle')
    .classed('sc-unselected', true)

    blobs.selectAll('circle')
    .classed('sc-selected', false)

}})

scrolly.addTrigger({num: 2, do: () => {

    resetYaxis(maxDeathRate);

    clearAnnotations()

    makeAnnotation('GBR','UK aims to vaccinate all adults by end of July', 'right',  130, 40, 30)

    if(!isMobile)makeAnnotation('ISR','Israel has seen a dramatic fall in deaths despite opening its economy', 'right',  130, 40, 40)


    blobs.selectAll('circle')
    .classed('sc-selected', false)

    blobs.selectAll('circle')
    .classed('sc-unselected', false)

    data.map(d => {


        let className = +d.vaccine_rate >= 50 ? 'sc-selected' : 'sc-unselected';

        blobs.select('.' + d.code)
        .classed(className, true);

    })



}});

scrolly.addTrigger({num: 3, do: () => {


    resetYaxis(maxDeathRate);

    clearAnnotations()

    makeAnnotation('CHL', "Chile is struggling to contain the Brazilian P1 variant", isMobile ? 'right' : 'top' )

    blobs.selectAll('circle')
    .classed('sc-unselected', true)

    blobs.selectAll('circle')
    .classed('sc-selected', false)


    blobs.select('.CHL')
    .classed('sc-unselected', false);

    blobs.select('.CHL')
    .classed('sc-selected', true);


}});

scrolly.addTrigger({num: 4, do: () => {

    clearAnnotations()

    resetYaxis(maxDeathRate);

    makeAnnotation('IND', "India’s population will take at least 18 months to sufficiently vaccinate at current rates",  'right',  130, 40, 30)
    makeAnnotation('BRA', "Deaths in Brazil are skyrocketing amid vaccine shortages", 'right', 130, 40, -5)
    if(!isMobile)makeAnnotation('KEN', "Kenya has tightened restrictions due to a large increase in coronavirus deaths", 'right', 130, 40, 35)

    blobs.selectAll('circle')
    .classed('sc-selected', false)

    blobs.selectAll('circle')
    .classed('sc-unselected', false)

    data.map(d => {


        let className = d.developing != 'High income' ? 'sc-selected' : 'sc-unselected';

        blobs.select('.' + d.code)
        .classed(className, true);
    })

}});

scrolly.addTrigger({num: 5, do: () => {


    clearAnnotations()

    resetYaxis(600, 5);

    makeAnnotation('FRA', "Many European states have yet to administer more than 25 doses per 100 people", 'right' , 120, 20, 55)

    blobs.selectAll('circle')
    .classed('sc-selected', false)

    blobs.selectAll('circle')
    .classed('sc-unselected', false)


    data.map(d => {

        let className = d.developing == 'High income' ? 'sc-selected' : 'sc-unselected';

        blobs.select('.' + d.code)
        .classed(className, true);

    })

}});

scrolly.addTrigger({num: 6 , do: () => {

    clearAnnotations()

    resetYaxis(600, 5);

    if(isMobile)console.log('isMobile')

    let offsetY = 95;

    if(!isMobile) offsetY = 50;
    if(isMobile && !isSafari) offsetY = 5;

    makeAnnotation('ISR', 'Israel has opened large parts of its economy to vaccinated "green pass" holders', isMobile ? 'top' : 'right' , 120, 20, offsetY)
    if(!isMobile)makeAnnotation('GBR', 'England hopes not to reinstitute the kind of harsh lockdown it exited in April', 'right' , 120, 20, 60)

    blobs.selectAll('circle')
    .classed('sc-selected', false)

    blobs.selectAll('circle')
    .classed('sc-unselected', false)


    data.map(d => {

        let className = d.stringency <= -10 ? 'sc-selected' : 'sc-unselected';

        blobs.select('.' + d.code)
        .classed(className, true);

    })

    d3.select('.scroll-text')
    .style('pointer-events', 'none')

    d3.select('.gv-scatterplot-1')
    .style('pointer-events', 'auto')

    d3.select('.gv-tooltip-container')
    .classed('over', false)

    svg.selectAll('circle')
    .style('stroke-width', '1px')

}});

scrolly.addTrigger({num: 7 , do: () => {

    resetYaxis(maxDeathRate);

    clearAnnotations()

    dataAlphabetical.map(d => {

        d3.select('.gv-countries-select')
        .append('option')
        .attr('value', d.code)
        .html(d.country)
        
    })

    d3.select('.gv-countries-select')
    .on('change', d => {

        clearAnnotations()

        let code = document.getElementsByClassName("gv-countries-select")[0].value;

        let countryData = data.find(f => f.code === code);

        makeTooltip(countryData, {x:+d3.select('.' + code).node().attributes.cx.value, y:+d3.select('.' + code).node().attributes.cy.value}, radius(+countryData.population))

    })

    blobs.selectAll('circle')
    .classed('sc-unselected', true)

    d3.select('.scroll-text')
    .style('pointer-events', 'auto')

    if(isMobile){
        d3.select('.gv-scatterplot-1')
        .style('pointer-events', 'none')
    }

}});

scrolly.watchScroll()

const clearAnnotations = () => {

    annotations.selectAll('text')
    .remove()

    annotations.selectAll('path')
    .remove()

    tooltipFurniture.selectAll('path').remove()
    tooltipFurniture.selectAll('polyline').remove()

    svg.selectAll('circle').style("stroke-width", 1);
    svg.selectAll('circle').style("stroke", '#ffffff');

}

const makeAnnotation = (country_code, text, align = 'left', textWidth = 130, offsetX = 30, offsetY = 15) => {

    let match = data.find(d => d.code === country_code);

    let r = radius(+match.population);
    let posX = align == 'left' ? xScale(match.vaccine_rate) - r : xScale(match.vaccine_rate) + r;
    let posY = yScale(match.deaths_rate);

    if(align === 'left')
    {
        let annBg = annotations
        .append("text")
        .attr("class", "annotationBg")
        .attr("x", d => posX - offsetX - textWidth - 5)
        .attr("y", d => posY)
        .text(text)
        .call(wrap, textWidth, 'textBg');

        let ann = annotations
        .append("text")
        .attr("class", "annotation")
        .attr("x", posX - offsetX - textWidth - 5 )
        .attr("y", posY)
        .text(text)
        .call(wrap, textWidth);


        let line = d3.line()([[posX , posY], [ posX, posY], [posX - offsetX, posY]])

        annotations
        .append('path')
        .attr('d', line)
        .attr('stroke', '#333333')
        .attr('stroke-width', 1.5)
    }
    else if(align === 'top'){

        let annBg = annotations
        .append("text")
        .attr("class", "annotationBg")
        .attr("x", posX - textWidth / 2)
        .attr("y",posY - offsetY)
        .text(text)
        .call(wrap, textWidth, 'textBg');

        let ann = annotations
        .append("text")
        .attr("class", "annotation")
        .attr("x", posX - textWidth / 2)
        .attr("y",posY - offsetY)
        .text(text)
        .call(wrap, textWidth);

        let annHeight = d3.select('.annotation').node().getBoundingClientRect().height;

        d3.selectAll(".annotationBg")
        .style('transform', `translate(0,-${annHeight + 10}px)`)

        d3.selectAll('.annotation')
        .style('transform', `translate(0,-${annHeight + 10}px)`)

        let line = d3.line()([[posX - r, posY], [ posX - r, posY], [posX - r, posY - 20]])

        annotations
        .append('path')
        .attr('d', line)
        .attr('stroke', '#333333')
        .attr('stroke-width', 1.5)

    }
    else
    {
        let annBg = annotations
        .append("text")
        .attr("class", "annotationBg")
        .attr("x",posX + offsetX + 5)
        .attr("y",posY - offsetY)
        .text(text)
        .call(wrap, textWidth, 'textBg');

        let ann = annotations
        .append("text")
        .attr("class", "annotation")
        .attr("x",posX + offsetX + 5 )
        .attr("y",posY - offsetY)
        .text(text)
        .call(wrap, textWidth);

        let line = d3.line()([[posX, posY], [ posX, posY], [posX + offsetX , posY]])

        annotations
        .append('path')
        .attr('d', line)
        .attr('stroke', '#333333')
        .attr('stroke-width', 1.5)
    }


}

const wrap = (text, width, className = '') => {
    text.each(function () {

        let text = d3.select(this);
        let words = text.text().split(/\s+/).reverse();

        let word;
        let line = [];
        let lineNumber = 0;
        let lineHeight = 1.1; // ems
        let x = text.attr("x");
        let y = text.attr("y");
        let dy = 0;

        let tspan = text.text(null)
        .append("tspan")
        .attr('class', className)
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");

        while (word = words.pop()) {

            line.push(word);

            tspan.text(line.join(" "));

            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                .attr('class', className)
                .attr("x", x)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
            }
        }
    });
}


if(!isMobile)
{
   annotationGreen
    .append("text")
    .attr('class', 'green-area-annotation-bg')
    .attr('x', (isMobile ? xScale(80) : xScale(50)) + 'px')
    .attr('y', (isMobile ? yScale(-200) - 25 : yScale(0) - 5)  + 'px')
    .text('Target: Deaths falling, high vaccination rate')
    .call(wrap, isMobile ? 150 : 400, 'green-area-annotation-bg');

    annotationGreen
    .append("text")
    .attr('class', 'green-area-annotation')
    .attr('x', (isMobile ? xScale(80) : xScale(50)) + 'px')
    .attr('y', (isMobile ? yScale(-200) - 25 : yScale(0) - 5)  + 'px')
    .text('Target: Deaths falling, high vaccination rate')
    .call(wrap, isMobile ? 150 : 400); 
}




const makeTooltip = (d,pos, radius, arrowRadius = 25) => {

    let tooltip = d3.select('.gv-tooltip-container');

    let linechartData = d.linechart.slice(0,d.linechart.length - 7)

    d3.select('.gv-tooltip-header-country-name')
    .html(d.country)

    d3.select('.gv-tooltip-header-vaccines-counter')
    .html('<b>' + d.total_vaccinations_per_hundred + '</b> vaccines per 100 people')

    d3.select('.gv-tooltip-container')
    .classed('over', true)

    let selection = null;

    if(event.currentTarget.value) selection = d3.select('.' + event.currentTarget.value)
    else selection = d3.select(event.currentTarget)

    selection.style("stroke-width", isMobile ? 3 : 2);
    selection.style("stroke", "#000000");

    const figureToDisplay = numberWithCommas(Math.floor(linechartData[linechartData.length - 1].deaths).toFixed(1)).replace('.0', "")

    if(linechartData.length > 0)
    {
        if(!isNaN(+linechartData[linechartData.length - 1].deaths))
        {

            d3.select('.gv-svg-tooltip')
            .attr('display', 'block')

            let xExtent = d3.extent(linechartData, e => parseTime(e.date));
            let yExtent = [0,d3.max(linechartData, e => +e.deaths)];

            xLine.domain(xExtent)
            yLine.domain(yExtent)
            .range([yExtent[1] < 120 ? yExtent[1] : 120, 0])

            xLine
            .range([25, isMobile ? width - (figureToDisplay.length * 8) - 5 : 200 - (figureToDisplay.length * 8) -5 ])

            yExtent[0] <= 10 ? d3.select('.gv-svg-tooltip').attr('height', 10) : d3.select('.gv-svg-tooltip').attr('height', 120)

            let linechart = d3.select('.gv-svg-tooltip path')
            .datum(linechartData)
            .attr('class', 'gv-line-chart')
            .attr("fill", "none")
            .attr('d', d3.line()
                .x(d => xLine(parseTime(d.date)))
                .y(d => yLine(+d.deaths))
            )

            let circle = d3.select('.gv-svg-tooltip circle')
            .datum([linechartData[linechartData.length - 1]])
            .attr('class', 'gv-linechart-circle')
            .attr('r', 3)
            .attr('cx', d => xLine(parseTime(d[0].date)))
            .attr('cy', d => yLine(+d[0].deaths))

            let text = d3.select('.gv-svg-tooltip .deaths .figure')
            .text(figureToDisplay)
            .attr("x", xLine(parseTime(linechartData[linechartData.length - 1].date)) + 7 )
            .attr("y", yLine(+linechartData[linechartData.length - 1].deaths))
            .call(wrap, 50);

           d3.select('.gv-svg-tooltip .deaths .value')
           .attr("x", xLine(parseTime(linechartData[linechartData.length - 1].date)) + 7 )
           .attr("y", yLine(+linechartData[linechartData.length - 1].deaths) + 15)

            let date = d3.select('.gv-svg-tooltip .date')
            .datum([linechartData[0]])
            .text('31 Jan')
            .attr("x", 0 )
            .attr("y", d => yLine(+d[0].deaths) - 25)
            .call(wrap, 5)

            d3.select('.gv-svg-tooltip')
            .attr('height', d3.select('.gv-line-chart').node().getBoundingClientRect().height)
        }
        else{

            d3.select('.gv-svg-tooltip')
            .attr('display', 'none')
        }

    }
    else{
        d3.select('.gv-svg-tooltip')
        .attr('height', 0)

        d3.select('.gv-svg-tooltip path')
        .attr('d','')

        d3.select('.gv-svg-tooltip circle')
        .attr('r', 0)

        d3.select('.gv-svg-tooltip .deaths')
        .text('')

        d3.select('.gv-svg-tooltip .date')
        .text('')
    }

    tooltipFurniture.selectAll('path').remove()
    tooltipFurniture.selectAll('polyline').remove()

    let tWidth = +tooltip.node().getBoundingClientRect().width;
    let tHeight = +tooltip.node().getBoundingClientRect().height;


    if(!isMobile)
    {
       if(pos.x > width / 2 )
        {
            let topLeft = tooltipFurniture.append('g')

            topLeft.append('path')
            .attr('d', describeArc(-arrowRadius, 0 , arrowRadius, 0, 90))//top left
            .attr('fill', 'none')
            .attr('stroke', 'black')

            topLeft.append('polyline')
            .attr('points', "4,-4.4 0,0 -4,-4.4")
            .attr('fill', 'none')
            .attr('stroke', 'black')

            topLeft
            .attr('transform', `translate(${pos.x},${pos.y -  radius})`)

            tooltip.style('left',  pos.x - tWidth - arrowRadius + 'px')
            tooltip.style('top',  pos.y  - (tHeight / 2)   + 'px')
        }

        if(pos.x < width / 2 )
        {
            let topRight = tooltipFurniture.append('g')

            topRight.append('path')
            .attr('d', describeArc(arrowRadius, 0, arrowRadius, 270, 0))//top right
            .attr('fill', 'none')
            .attr('stroke', 'black')

            topRight.append('polyline')
            .attr('points', "4,-4.4 0,0 -4,-4.4")
            .attr('fill', 'none')
            .attr('stroke', 'black')

            topRight
            .attr('transform', `translate(${pos.x},${pos.y -  radius})`)

            tooltip.style('left',  pos.x + arrowRadius + 'px')
            tooltip.style('top',  pos.y - (tHeight / 2)   + 'px')
        }

    }
    else
    {
        tooltip.style('left',  0 + 'px')

        d3.select('.gv-svg-tooltip')
        .attr('width', width - 50)


        if(pos.y > height /2)
        {
            tooltip.style('top',  0   + 'px')
        }
        else{
            tooltip.style('top',  pos.y + (radius ^ 2)   + 'px')
        }
    }

    if(pos.y - (tHeight / 2) < 0){
            tooltip.style('top', 0  + 'px')
    }

    if(pos.y  + (tHeight / 2) > height){
           tooltip.style('top', height - tHeight  + 'px')
    }

    if(isMobile)tooltip.style('top', 0  + 'px')
    if(isMobile)tooltip.style('width','100%')
    if(isMobile)tooltip.sytle('left', '-10px')


    
}


const resetYaxis = (yMax, ticks = 10) => {

    yScale
    .domain([-100, yMax]);

    d3.select(".yaxis")
    .transition()
    .duration(1000)
    .call(
        d3.axisLeft(yScale)
        .ticks(ticks)
        .tickSizeInner(-width)
    )
    .selectAll('text')
    .attr('y', -10);

    blobs.selectAll('circle')
    .data(data)
    .transition()
    .duration(1000)
    .attr('cx', d => xScale(+d.vaccine_rate))
    .attr('cy', d => yScale(+d.deaths_rate))
    .attr('r', d => radius(+d.population))

    greenArea
    .transition()
    .duration(1000)
    .attr('height', yScale(yMax - 100) - 20+ 'px')
    .attr('y', yScale(0) + 'px')

    d3.select('.green-area-annotation')
    .transition()
    .duration(1000)
    .attr('y', (isMobile ? yScale(-100) - 25 : yScale(0) - 5)  + 'px')


    annotationGreen.selectAll('tspan')
    .transition()
    .duration(1000)
    .attr('y', isMobile ? yScale(-100) - 25 : yScale(0) - 5 + 'px')

}


