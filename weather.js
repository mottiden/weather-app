const cF = document.querySelector('.c-f');
const hourly = document.querySelector('ul.hourly');
const daily = document.querySelector('ul.daily');
const today = document.querySelector('.today');
const week = document.querySelector('.this-week');
const loader = [...document.querySelectorAll('.loader')];
const curr = document.querySelector('.currently');
const clock = document.querySelector('.clock');

function parseForecasts(json) {
  const data = {};
  const days = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

  data.currently = json.currently;// actual weather conditions
  data.hourly = json.hourly;// weather for the next 48h
  data.hourly.data = data.hourly.data.splice(1, 12);// taking only the first 24h
  data.daily = json.daily;// week weather conditions
  // parsing hourly
  data.hourly.data.map((el) => {
    el.time = new Date(el.time * 1000).getHours();
    el.precipProbability = Math.round(el.precipProbability * 100);
  });

  // parsing daily
  data.daily.data.map((el) => {
    el.time = days[new Date(el.time * 1000).getDay()];
    el.precipProbability = Math.round(el.precipProbability * 100);
  });

	// parsing currently
  data.currently.temperature = `${Math.round(data.currently.temperature)}&#176`;
  data.currently.humidity = Math.round(data.currently.humidity * 100);
  data.currently.time = new Date(data.currently.time * 1000).toDateString();

  return data;
}


function visualizeForecasts(d, l) {
  const currently = [...document.querySelectorAll('span[data-currently]')];
  const mainIcon = document.querySelector('i.icon');
  const location = document.querySelector('h1.location');
  const icons = { 'partly-cloudy-night': 'wi wi-night-alt-cloudy', 'partly-cloudy-day': 'wi wi-day-sunny-overcast', 'clear-day': 'wi wi-day-sunny', cloudy: 'wi wi-cloudy', fog: 'wi wi-fog', 'clear-night': 'wi wi-night-clear', rain: 'wi wi-rain', sleet: 'wi wi-sleet', snow: 'wi wi-snowflake-cold' };
  const dailyContent = [];
  const hourlyContent = [];

  loader.map(el => el.style.display = 'none');
  hourly.style.display = 'flex';
  curr.style.display = 'flex';
  clock.style.display = 'block';


  location.innerHTML = l[0].results[4].formatted_address;
  currently.map(span => span.innerHTML = d.currently[`${span.dataset.currently}`]);
  mainIcon.className = `icon ${icons[d.currently.icon]}`;

  d.hourly.data.forEach((el, i) => {
    hourlyContent.push(`
    <li class="hourly-${i}"> 
        <span data-hourly="temperature">${Math.round(el.temperature)}&#176;</span> 
        <span data-hourly="precipProbability">${el.precipProbability}<i class="wi wi-humidity"></i></span>
        <i class="${icons[el.icon]}"></i>
        <span data-hourly="time">${el.time}</span>
    </li>`);
  });

  d.daily.data.forEach((el, i) => {
    dailyContent.push(`
    <li class="daily-${i}"> 
        <span data-daily="temperatureMax">${Math.round(el.temperatureMax)}&#176; max</span> 
        <span data-daily="temperatureMin">${Math.round(el.temperatureMin)}&#176; min</span>
        <span data-daily="precipProbability">${el.precipProbability}<i class="wi wi-humidity"></i></span>
        <i class="${icons[el.icon]}"></i>
        <span data-daily="time">${el.time}</span>
    </li>`);
  });

  daily.innerHTML = dailyContent.join('');
  hourly.innerHTML = hourlyContent.join('');
}

// convert degrees to celsius
function fToC(fah) {
  const cel = (fah - 32) * (5 / 9);
  return cel;
}

function cToF(cel) {
  const fah = (cel * (9 / 5)) + 32;
  return fah;
}

function change() {
  const tempsMaxDaily = [...document.querySelectorAll("span[data-daily='temperatureMax']")];
  const tempsMinDaily = [...document.querySelectorAll("span[data-daily='temperatureMin']")];
  const tempsCurr = document.querySelector("span[data-currently='temperature']");
  const tempsHourly = [...document.querySelectorAll("span[data-hourly='temperature']")];

  if (this.lastChild.classList[2] === 'temp-active') {
    this.lastChild.classList.toggle('temp-active');
    this.firstChild.classList.toggle('temp-active');
    tempsCurr.innerHTML = `${Math.round(fToC(parseFloat(tempsCurr.innerHTML)))}&#176;`;
    tempsMaxDaily.map(el => el.innerHTML = `${Math.round(fToC(parseFloat(el.innerHTML)))}&#176; max`);
    tempsMinDaily.map(el => el.innerHTML = `${Math.round(fToC(parseFloat(el.innerHTML)))}&#176; min`);
    tempsHourly.map(el => el.innerHTML = `${Math.round(fToC(parseFloat(el.innerHTML)))}&#176;`);
  } else {
    this.lastChild.classList.toggle('temp-active');
    this.firstChild.classList.toggle('temp-active');
    tempsCurr.innerHTML = `${Math.round(cToF(parseFloat(tempsCurr.innerHTML)))}&#176;`;
    tempsMaxDaily.map(el => el.innerHTML = `${Math.round(cToF(parseFloat(el.innerHTML)))}&#176; max`);
    tempsMinDaily.map(el => el.innerHTML = `${Math.round(cToF(parseFloat(el.innerHTML)))}&#176; min`);
    tempsHourly.map(el => el.innerHTML = `${Math.round(cToF(parseFloat(el.innerHTML)))}&#176;`);
  }
}

function showForecast() {
  if (this.className === 'today') {
    hourly.style.display = 'flex';
    daily.style.display = 'none';
  } else {
    hourly.style.display = 'none';
    daily.style.display = 'flex';
  }
}

function getForecasts(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const place = [latitude, longitude];
  const where = [];

  // calling google maps API for name city
  const googleMaps = '9asdsdadasdasdasdasdaa183ce65fbb7ae';
  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleKey}`;
  fetch(googleMaps)
  .then(response => response.json())
  .then(data => where.push(data));

  // calling dark-sky API using Fetch
  const key = '9asdsdadasdasdasdasdaa183ce65fbb7ae';
  const darkSky = `https://crossorigin.me/https://api.darksky.net/forecast/${key}/${latitude},${longitude}?data=auto`;
  fetch(darkSky)
  .then(response => response.json())
  .then(data => parseForecasts(data))
  .then(parsed => visualizeForecasts(parsed, where));
}

const options = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

function error() {
  return console.error('Unable to retrieve your location');
}

const hands = document.getElementsByClassName('hand');


setInterval(() => {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  hands[0].style.transform = `rotate(${90 + (hour * (360 / 12))}deg)`;
  hands[1].style.transform = `rotate(${90 + (minute * (360 / 60))}deg)`;
  hands[2].style.transform = `rotate(${90 + (seconds * (360 / 60))}deg)`;
}, 1000);

cF.addEventListener('click', change);
today.addEventListener('click', showForecast);
week.addEventListener('click', showForecast);
navigator.geolocation.getCurrentPosition(getForecasts, error, options);

