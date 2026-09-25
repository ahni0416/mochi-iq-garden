// Weather provider boundary. A remote provider can replace this without changing the UI.
export function getCurrentWeather(now = Date.now()) {
  const preview = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('weather') : null;
  if (['sunny', 'cloudy', 'windy', 'rain', 'storm'].includes(preview)) {
    return { weatherType: preview, temperature: null, windSpeed: null, rainProbability: null, timestamp: now };
  }
  const roll = Math.random();
  const weatherType = roll < .50 ? 'sunny' : roll < .70 ? 'cloudy' : roll < .83 ? 'windy' : roll < .97 ? 'rain' : 'storm';
  return { weatherType, temperature: null, windSpeed: null, rainProbability: null, timestamp: now };
}

export function getTimeOfDay(date = new Date()) {
  const preview = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('time') : null;
  if (['morning', 'afternoon', 'evening', 'night'].includes(preview)) return preview;
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'evening';
  return 'night';
}

export function getDaylightPhase(date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 20 && hour < 22) return 'dusk';
  return hour >= 7 && hour < 20 ? 'daylight' : 'dark';
}

// Move between neighboring conditions so weather never jumps directly from clear to storm.
const transitions = {
  sunny: ['cloudy', 'windy'],
  cloudy: ['sunny', 'windy', 'rain'],
  windy: ['sunny', 'cloudy', 'rain'],
  rain: ['cloudy', 'storm'],
  storm: ['rain', 'cloudy'],
};
export function nextWeather(weather) {
  const options = transitions[weather] || transitions.sunny;
  return options[Math.floor(Math.random() * options.length)];
}
