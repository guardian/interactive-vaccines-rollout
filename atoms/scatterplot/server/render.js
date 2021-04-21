import mainHTML from "./atoms/scatterplot/server/templates/main.html!text"
/*import fs from 'fs'
import axios from 'axios'
import csvParse from "csv-parse/lib/es5/sync";
import moment from 'moment'

const urls = [
'https://interactive.guim.co.uk/2021/jan/vaccinations/vaccinations.csv',
'https://interactive.guim.co.uk/2020/coronavirus-jh-timeline-data/time_series_covid19_deaths_global.csv',
'https://interactive.guim.co.uk/docsdata-test/1INc3IO8jmlphkyIa4TRw3I7DQ3LDT6OY3h9qPs-ODv0.json'
]

const countriesWithRegions = ['China', 'Canada', 'Australia'];

let countriesObjs = [];

let master = [];

async function fetch(url){

	const dataRaw = await axios.get(url);

	return dataRaw

}

Promise.all(urls.map(u=>fetch(u)))
.then(responses => {


	const vaccinations = csvParse(responses[0].data.toString(),{columns: true});

	const deaths = csvParse(responses[1].data.toString(),{columns: true});

	const rates = responses[2].data.sheets.Master;

	let datesDeaths = Object.getOwnPropertyNames(deaths[0]).splice(4,  Object.getOwnPropertyNames(deaths[0]).length -1)

	countriesWithRegions.map(d => {

		let allRegions = deaths.filter(f => f['Country/Region'] === d)

		let countryObj = {
			'Province/State': '',
			'Lat':'',
			'Lon':'',
			'Country/Region': d
		}

		datesDeaths.map(d => {

			let countryDeathsDate = []

			allRegions.map(e => {

				countryDeathsDate.push(+e[d])

			})

			countryObj[d] = countryDeathsDate.reduce((a, b) => a + b, 0).toString()

		})

		countriesObjs.push(countryObj)
	})

	deaths.map( d => {

		if(countriesWithRegions.indexOf(d['Country/Region']) == -1)
		{

			let realName = d['Province/State'] != '' ?  d['Province/State'] : d['Country/Region'];

			if(d['Country/Region'] === 'Taiwan*')realName = 'Taiwan'

			d['Country/Region'] = realName

			countriesObjs.push(d)
		}
	})


	const dailyCases = []


	countriesObjs.map( (d,i) => {

		let daily = 0;

		dailyCases.push({
			country: d['Country/Region'],
			cases:[]
		})

		datesDeaths.map((e,j) => {
			

			if(!isNaN(d[e]-d[datesDeaths[j-1]]))daily = d[e]-d[datesDeaths[j-1]]

			dailyCases[i].cases.push({
				date:e,
				deaths:daily
			})
		
		})
	})


	const dailyCasesAvg = []

	dailyCases.map((d,i) => {

		let daily = 0;

		dailyCasesAvg.push({
			country: d.country,
			cases:[]
		})

		d.cases.map((e,j) => {

			let period = d.cases.slice(j,7+j)

			let avg = period.reduce((a, b) => a + (b['deaths'] || 0), 0) / period.length;

			dailyCasesAvg[i].cases.push({
				date:period[0].date,
				deaths:avg
			})
		})

	})

	rates.map(d => {

		let deathsMatchRaw = dailyCasesAvg.find(f => f.country === d['Country/Region']);

		let cases = []

		if(deathsMatchRaw)
		{
			cases = deathsMatchRaw.cases.filter(m => moment(m.date, "M/D/YY") >= moment('1/31/21', "M/D/YY") )
		}
		
		let  allvaccines = vaccinations.filter(f => f.iso_code === d['Country Code']);

		let total_vaccinations_per_hundred = null;
		
		if(allvaccines[allvaccines.length -1])total_vaccinations_per_hundred = allvaccines[allvaccines.length -1].total_vaccinations_per_hundred;


		let obj = deaths.find(f => f['Country/Region'] === d['Country/Region'])


		if(d['Vaccine rate (latest)'] && +d['Change in new deaths since 31 Jan'] <= 1000)
		{
			master.push({
				country:d['Country/Region'],
				code:d['Country Code'],
				population:d.population,
				vaccine_rate:d['Vaccine rate (latest)'],
				deaths_rate:d['Change in new deaths since 31 Jan'],
				total_vaccinations_per_hundred:total_vaccinations_per_hundred,
				stringency:d['Stringency_change'],
				developing:d['Developing?'],
				linechart:cases
			})
		}
	})

})
.then(d => {

	fs.writeFileSync('assets/all.json', JSON.stringify(master));
})*/


export async function render() {
	return mainHTML;
} 