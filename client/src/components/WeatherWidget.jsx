import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Droplets, MapPin, Loader2, ThermometerSun } from 'lucide-react';
import axios from 'axios';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Loading...');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const savedProfile = localStorage.getItem('farmerProfile');
        let region = 'Nairobi'; 
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          if (profile.region) region = profile.region;
        }

        setLocationName(region);

        let lat = -1.2833; 
        let lon = 36.8167;

        // CHECK MEMORY FIRST: Do we already know the coordinates for this region?
        const cachedCoords = localStorage.getItem(`coords_${region}`);

        if (cachedCoords) {
          // Fast Path: Use saved coordinates!
          const parsed = JSON.parse(cachedCoords);
          lat = parsed.lat;
          lon = parsed.lon;
        } else {
          // Slow Path: Ask the Geocoding API, then save it for next time
          const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${region}&count=1&format=json`);
          if (geoRes.data.results && geoRes.data.results.length > 0) {
            lat = geoRes.data.results[0].latitude;
            lon = geoRes.data.results[0].longitude;
            // Save to memory!
            localStorage.setItem(`coords_${region}`, JSON.stringify({ lat, lon }));
          }
        }

        // Fetch the live weather using the fast coordinates
        const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max,precipitation_probability_max&timezone=Africa%2FNairobi`);
        
        setWeather(weatherRes.data);
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);


  // Helper to turn WMO weather codes into readable text and icons
  const getWeatherDetails = (code) => {
    if (code === 0) return { text: 'Clear Sky', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' };
    if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-100' };
    if (code >= 51 && code <= 67) return { text: 'Raining', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-100' };
    if (code >= 80 && code <= 99) return { text: 'Showers / Storms', icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-100' };
    return { text: 'Cloudy', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-32 mb-6">
        <Loader2 className="animate-spin text-green-600" size={24} />
        <span className="ml-2 text-gray-500 text-sm font-medium">Checking the skies...</span>
      </div>
    );
  }

  if (!weather) return null;

  const currentDetails = getWeatherDetails(weather.current.weather_code);
  const CurrentIcon = currentDetails.icon;

  return (
    <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-3xl shadow-sm mb-8 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <CurrentIcon size={120} />
      </div>

      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        
        {/* Left Side: Current Weather */}
        <div>
          <div className="flex items-center gap-2 text-green-100 mb-3 font-medium text-sm">
            <MapPin size={16} />
            <span>{locationName}, Kenya</span>
          </div>
          
          <div className="flex items-end gap-4">
            <h2 className="text-5xl font-black text-white tracking-tighter">
              {Math.round(weather.current.temperature_2m)}°
            </h2>
            <div className="mb-1">
              <p className="text-green-50 font-bold text-lg leading-tight">{currentDetails.text}</p>
              <p className="text-green-200 text-sm">Today's High: {Math.round(weather.daily.temperature_2m_max[0])}°</p>
            </div>
          </div>
        </div>

        {/* Right Side: Farm Indicators */}
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 sm:w-32 flex flex-col items-center justify-center text-white">
            <Droplets size={24} className="mb-2 text-blue-300" />
            <p className="text-xs text-green-100 font-medium text-center uppercase tracking-wider mb-0.5">Rain Chance</p>
            <p className="text-xl font-bold">{weather.daily.precipitation_probability_max[0]}%</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex-1 sm:w-32 flex flex-col items-center justify-center text-white">
            <ThermometerSun size={24} className="mb-2 text-orange-300" />
            <p className="text-xs text-green-100 font-medium text-center uppercase tracking-wider mb-0.5">Condition</p>
            <p className="text-sm font-bold text-center mt-1">
              {weather.current.precipitation > 0 ? 'Too Wet to Spray' : 'Good for Spraying'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}