var startTime;
var today = dayjs().format('YYYY-MM-DD');
const apiKey = 'c65a83f1b41423a44ca059c4924fe1cd';

var inputs = {
  city: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
  zoom: 1,
  style: 'default',
  date: today,
}

const dateInput = document.getElementById('date-input');
dateInput.value = today;
dateInput.min = today;
dateInput.max = dayjs().add(16, 'days').format("YYYY-MM-DD");


if(location.search !== '') {
  var searchString = location.search + '&';
  for(var i in inputs) {
    const inputString = i + '=';
    const startIndex = searchString.indexOf(inputString)+inputString.length;
    const ampIndex = searchString.indexOf('&');
    inputs[i] = searchString.slice(startIndex, ampIndex);
    searchString = searchString.slice(ampIndex+1);
    console.log(i, inputs[i]);
    document.getElementById(i).value = inputs[i];
  }

  // convert input from string to int
  inputs.zoom = parseInt(inputs.zoom);
  if(inputs.latitude === '' || inputs.longitude === '') {

    locationToCoordinates(formatLocationString());
  }
  else {
    inputs.latitude = parseFloat(inputs.latitude);
    inputs.longitude = parseFloat(inputs.longitude);
    displayMap(inputs.latitude, inputs.longitude);
  }
}

function formatLocationString() {
  var locationString = '';
  if(inputs.city !== '')
    locationString += inputs.city + ',';
  if(inputs.state !== '')
    locationString += inputs.state + ',';
  if(inputs.country !== '')
    locationString += inputs.city;
  return locationString;
}

async function locationToCoordinates(locationString) {
  await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${locationString}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      inputs.latitude = data.coord.lat;
      inputs.longitude = data.coord.lon;
      displayMap(inputs.latitude, inputs.longitude);
    })
    .catch(error => console.log(error));
}


//Call geolocation
// function getWeatherData() {
//   fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${valueToFetchWeather}&appid=${apiKey}`)
//       .then(response => response.json())
//       .then((data) => this.displayLocation(data[0]));
// }

// function displayLocation(data) {
//   locationName = data.name;
//   lon = data.lon;
//   lat = data.lat;
//   country = data.country;
//   console.log(locationName, lat, lon, country);
// }

//Call the weather
function getWeatherDesc() {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
      .then(response => response.json())
      .then((data) => this.displayWeather(data[0]));
}

function displayWeather(data) {
  weatherMain = data.weather[0].main;
  weatherDesc = data.weather[0].description;
  humidity = data.main.humidity;
  wind = data.wind.speed;
  sunrise = data.sys.sunrise;
  sunset = data.sys.sunset;
  console.log(weatherMain, description, humidity, wind, sunrise, sunset);
  concertEpoch()
}

//Convert sunrise/sunset Epoch to hh:mm
function convertEpoch() {
  let sunriseTime = new Date(sunrise * 1000);
  let sunriseHours = sunriseTime.getUTCHours().toString().padStart(2, 0);
  let sunriseMinutes = sunriseTime.getUTCMinutes().toString().padStart(2, 0);

  let sunsetTime = new Date(sunset * 1000);
  let hours = sunsetTime.getUTCHours().toString().padStart(2, 0);
  let minutes = sunsetTime.getUTCMinutes().toString().padStart(2, 0);

  console.log(sunriseHours + ':' + sunriseMinutes + ' AM');
  console.log(sunsetHours + ':' + sunsetMinutes + ' PM');
}

// 8 day forecast. need to repeat for string
function getForecast() {
  fetch("https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&exclude=minutely,hourly&units=imperial&appid=c65a83f1b41423a44ca059c4924fe1cd")

  .then((response) => response.json())
    // .then((data) => console.log(data.daily[0]))
    .then((data) => this.displayForecast(data.daily[0]));
}

function displayForecast(data) {
let date = new Date(data.dt * 1000)
let simpleDate = date.toISOString().split('T')[0]
let icon = data.weather[0].icon;
let main = data.weather[0].main;
let maxTemp = data.temp.max;
let minTemp = data.temp.min;
console.log(simpleDate, icon, main, maxTemp, minTemp)
// forecast img link from api
// 'https://openweathermap.org/img/wn/${icon}@2x.png'
}



function displayMap(lat, lon) {
  console.log(lat, lon);
  // Create a Leaflet map centered on the location
  const map = L.map('map').setView([lat, lon], 12);
  // Add a tile layer to the map 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
  }).addTo(map);
  // Add a tile layer for the cloud layer 
  var cloudLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`,
  {
    attribution: '',
    filter: [
      'brightness:80%',
      'contrast:100%',
      'saturate:100%',
      'hue:270deg',
      'sepia:100%',
      'opacity:1.0'
    ],
    palette: {
    }
  }
  ).addTo(map);
  // Add tile layer for precipitation   
  var precipitationLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
  opacity: 1,
  attribution: '<a href="https://openweathermap.org/">OpenWeatherMap</a>',
  }).addTo(map);
  // Add a marker to the map at the location
  L.marker([lat, lon]).addTo(map);
  fetchStarChart();
}

async function fetchStarChart() {
  const applicationId = "2783890d-6a79-4a53-85ea-a093142ad152";
  const applicationSecret ="31acc37032ad69c4d5f7928586e995f9f30116465cf5dbc9669b235b5d71362584d5ba854089cc09e823e2052b7d0b4d2a30ed06d6e1ca2bf2995fcfae759c8f8004d66ad88d304c3219be628bf106d4f2a6ccd2e52fa416d1d575ddeb9e87d9536f373b6af2e372b0f92e7a1f6478ed";
  const authString = btoa(`${applicationId}:${applicationSecret}`);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify({
      "style": inputs.style,
      "observer": {
          "latitude": inputs.latitude,
          "longitude": inputs.longitude,
          "date": inputs.date
      },
      "view": {
          "type": "area",
          "parameters": {
              "position": {
                  "equatorial": {
                      "rightAscension": 0,
                      "declination": 0
                  }
              },
              "zoom": inputs.zoom
          }
      }
      })
  };
  console.log(options.body);
  const url = "https://api.astronomyapi.com/api/v2/studio/star-chart";
  startTime = new Date();
  console.log('timer started');
  await fetch(url, options)
    .then((response) => response.json())
    .then((responseData) => displayStarChart(responseData.data));
}

function displayStarChart(data) {
    console.log((new Date() - startTime)/1000); // display time to load chart
    console.log(data);
    console.log(data.imageUrl);
    document.getElementById("star-chart").src = data.imageUrl;
}
