import { useEffect, useState } from "react";
import AppsLayout from "./AppsLayout";

interface WeatherData {
  date: string;
  temp: number;
  condition: string;
  description: string;
  windSpeed: number;
  humidity: number;
}

interface CityWeather {
  city: string;
  country: string;
  forecast: WeatherData[];
  loading: boolean;
  error: string | null;
}

const CITIES = [
  { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
  { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
  { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
  { name: "Bergen", country: "NO", lat: 60.3913, lon: 5.3221 },
  { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
  { name: "Dubai", country: "AE", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", country: "SG", lat: 1.3521, lon: 103.8198 },
];

// Get weather icon emoji based on yr.no condition/symbol code
const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();

  // yr.no symbol codes: clearsky, partlycloudy, cloudy, lightrain, rain, heavyrain, sleet, lightsnow, snow, heavysnow, etc.
  if (
    lowerCondition.includes("clearsky") ||
    lowerCondition === "clear" ||
    lowerCondition.includes("sunny")
  ) {
    return "☀️";
  } else if (lowerCondition.includes("thunder")) {
    return "⛈️";
  } else if (
    lowerCondition.includes("heavyrain") ||
    lowerCondition.includes("heavy rain")
  ) {
    return "🌧️";
  } else if (
    lowerCondition.includes("rain") ||
    lowerCondition.includes("drizzle")
  ) {
    return "🌦️";
  } else if (
    lowerCondition.includes("heavysnow") ||
    lowerCondition.includes("heavy snow")
  ) {
    return "❄️";
  } else if (
    lowerCondition.includes("snow") ||
    lowerCondition.includes("sleet")
  ) {
    return "🌨️";
  } else if (lowerCondition.includes("cloudy") || lowerCondition === "clouds") {
    return "☁️";
  } else if (
    lowerCondition.includes("partlycloudy") ||
    lowerCondition.includes("partly cloudy") ||
    lowerCondition.includes("fair")
  ) {
    return "⛅";
  } else if (
    lowerCondition.includes("fog") ||
    lowerCondition.includes("mist") ||
    lowerCondition.includes("haze")
  ) {
    return "🌫️";
  } else if (lowerCondition.includes("wind")) {
    return "💨";
  }
  return "🌤️";
};

const Weather = ({
  onClose,
  clickPosition,
}: {
  onClose: () => void;
  clickPosition: { x: number; y: number };
}) => {
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [citiesWeather, setCitiesWeather] = useState<CityWeather[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Initialize cities weather state
  useEffect(() => {
    setCitiesWeather(
      CITIES.map((city) => ({
        city: city.name,
        country: city.country,
        forecast: [],
        loading: false,
        error: null,
      }))
    );
  }, []);

  // Fetch weather data for a city using yr.no API (MET Norway)
  const fetchWeatherData = async (
    cityName: string,
    lat: number,
    lon: number
  ) => {
    setCitiesWeather((prev) =>
      prev.map((city) =>
        city.city === cityName ? { ...city, loading: true, error: null } : city
      )
    );

    try {
      // yr.no API (MET Norway) - Locationforecast 2.0
      // Note: MET Norway API doesn't support CORS from browsers
      // In development, we use Vite's proxy (/api/metno)
      // In production, you should set up a backend proxy endpoint

      // Check if we're in development (localhost) to use Vite proxy
      const isDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      let apiUrl;
      if (isDevelopment) {
        // Use Vite proxy in development
        apiUrl = `/api/metno/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
      } else {
        // In production, try direct fetch first, then fallback to CORS proxy
        apiUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
      }

      let response;
      let data;

      try {
        // Attempt API call
        response = await fetch(apiUrl, {
          headers: {
            "User-Agent": "WeatherApp/1.0 (someoneelssesmainportfolio)",
          },
        });

        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`
          );
        }
      } catch (fetchError: any) {
        // If CORS fails and we're in production, try a CORS proxy as fallback
        if (
          (!isDevelopment && fetchError.message?.includes("CORS")) ||
          fetchError.message?.includes("blocked")
        ) {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(
            apiUrl
          )}`;

          response = await fetch(proxyUrl);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch weather data via proxy: ${response.statusText}`
            );
          }

          data = await response.json();
        } else {
          throw fetchError;
        }
      }

      if (!data || !data.properties) {
        throw new Error("Invalid API response format");
      }

      // Process yr.no API response
      // The API returns hourly forecasts, we need to group by day
      const dailyForecasts = new Map<string, any[]>();

      if (data.properties && data.properties.timeseries) {
        data.properties.timeseries.forEach((item: any) => {
          const date = new Date(item.time);
          const dateKey = date.toDateString();

          if (!dailyForecasts.has(dateKey)) {
            dailyForecasts.set(dateKey, []);
          }
          dailyForecasts.get(dateKey)!.push(item);
        });
      }

      // Convert to 7-day forecast array
      const forecast: WeatherData[] = Array.from(dailyForecasts.entries())
        .slice(0, 7)
        .map(([, items]) => {
          // Use the middle interval of the day (around noon) as representative
          const representativeItem =
            items[Math.floor(items.length / 2)] || items[0];
          const date = new Date(representativeItem.time);

          // Calculate average temp from all intervals for the day
          const temps = items.map(
            (item: any) => item.data.instant.details.air_temperature
          );
          const avgTemp =
            temps.reduce((sum: number, temp: number) => sum + temp, 0) /
            temps.length;

          // Get weather condition from symbol code
          const symbolCode =
            representativeItem.data.next_6_hours?.summary?.symbol_code ||
            representativeItem.data.next_1_hours?.summary?.symbol_code ||
            representativeItem.data.next_12_hours?.summary?.symbol_code ||
            "clearsky_day";

          // Parse symbol code to get condition (e.g., "clearsky_day", "partlycloudy_night", "heavyrain", etc.)
          // Remove time of day suffixes (_day, _night, _polartwilight)
          const condition = symbolCode.replace(
            /_day|_night|_polartwilight/g,
            ""
          );

          // Create a more readable description
          const description = condition
            .replace(/_/g, " ")
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          // Get wind speed (m/s)
          const windSpeed =
            representativeItem.data.instant.details.wind_speed || 0;
          // Get humidity (%)
          const humidity =
            representativeItem.data.instant.details.relative_humidity || 0;

          return {
            date: date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            temp: Math.round(avgTemp),
            condition: condition,
            description: description,
            windSpeed: Math.round(windSpeed * 3.6), // Convert m/s to km/h
            humidity: Math.round(humidity),
          };
        });

      setCitiesWeather((prev) =>
        prev.map((city) =>
          city.city === cityName
            ? {
                ...city,
                forecast,
                loading: false,
                error: null,
              }
            : city
        )
      );
    } catch (error: any) {
      setCitiesWeather((prev) =>
        prev.map((city) =>
          city.city === cityName
            ? {
                ...city,
                loading: false,
                error: error.message || "Failed to load weather data",
              }
            : city
        )
      );
    }
  };

  // Preload today's weather for all cities when main view is shown
  useEffect(() => {
    if (showContent && !selectedCity) {
      // Load today's weather for all cities to display on cards
      CITIES.forEach((city) => {
        const cityWeather = citiesWeather.find((c) => c.city === city.name);
        // Only fetch if we don't have data yet
        if (!cityWeather || cityWeather.forecast.length === 0) {
          // Fetch minimal data for card display (just need today's forecast)
          fetchWeatherData(city.name, city.lat, city.lon);
        }
      });
    }
  }, [showContent, selectedCity]);

  // Load full forecast for selected city when viewing details
  useEffect(() => {
    if (selectedCity && showContent) {
      const cityInfo = CITIES.find((c) => c.name === selectedCity);
      const cityWeather = citiesWeather.find((c) => c.city === selectedCity);

      if (cityInfo && (!cityWeather || cityWeather.forecast.length === 0)) {
        fetchWeatherData(selectedCity, cityInfo.lat, cityInfo.lon);
      }
    }
  }, [selectedCity, showContent]);

  if (showLoading) {
    return (
      <div className="w-151 h-321.5 rounded-[71px] relative flex items-center justify-center overflow-hidden bg-orange-500">
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            transformOrigin: `${clickPosition.x}px ${clickPosition.y}px`,
            animation:
              "iosAppOpen 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
          }}
        >
          <div className="text-white text-6xl">☀️</div>
          <div className="text-white text-2xl font-semibold">Weather</div>
        </div>
      </div>
    );
  }

  if (showContent) {
    // If a city is selected, show the forecast detail view
    if (selectedCity) {
      const selectedCityWeather = citiesWeather.find(
        (c) => c.city === selectedCity
      );
      const selectedCityInfo = CITIES.find((c) => c.name === selectedCity);
      const todayForecast = selectedCityWeather?.forecast?.[0];

      // Get gradient based on weather condition
      const getGradient = (condition: string) => {
        const lowerCondition = condition?.toLowerCase() || "";
        if (
          lowerCondition.includes("clearsky") ||
          lowerCondition.includes("sunny")
        ) {
          return "from-yellow-400 via-orange-400 to-pink-500";
        } else if (
          lowerCondition.includes("rain") ||
          lowerCondition.includes("drizzle")
        ) {
          return "from-blue-500 via-indigo-600 to-purple-700";
        } else if (lowerCondition.includes("snow")) {
          return "from-blue-300 via-cyan-400 to-blue-500";
        } else if (lowerCondition.includes("cloudy")) {
          return "from-gray-400 via-gray-500 to-gray-600";
        } else if (lowerCondition.includes("thunder")) {
          return "from-purple-600 via-indigo-700 to-gray-800";
        }
        return "from-sky-400 via-blue-500 to-indigo-600";
      };

      const gradient = getGradient(todayForecast?.condition || "");

      return (
        <AppsLayout onClose={onClose} title={selectedCity || "Weather"}>
          <div
            className={`h-full flex flex-col bg-gradient-to-b ${gradient} pt-30`}
          >
            {/* Header Section */}
            <div className="px-4 pt-6 pb-4">
              <button
                onClick={() => setSelectedCity(null)}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
              >
                <span className="text-xl font-bold">←</span>
                <span className="text-sm font-medium">Back</span>
              </button>

              {todayForecast && (
                <div className="text-center text-white mb-2">
                  <div className="text-7xl mb-2">
                    {getWeatherIcon(todayForecast.condition)}
                  </div>
                  <div className="text-5xl font-bold mb-1">
                    {todayForecast.temp}°C
                  </div>
                  <div className="text-lg font-medium capitalize mb-1">
                    {todayForecast.description}
                  </div>
                  <div className="text-sm opacity-90">
                    {selectedCity}, {selectedCityInfo?.country}
                  </div>
                </div>
              )}
            </div>

            {/* Weather Forecast */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {selectedCityWeather?.loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-lg font-semibold">
                      Loading weather...
                    </div>
                  </div>
                </div>
              ) : selectedCityWeather?.error ? (
                <div className="flex items-center justify-center h-full px-4">
                  <div className="text-white text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-3xl mb-3">⚠️</div>
                    <div className="text-xl font-semibold mb-2">Error</div>
                    <div className="text-sm opacity-90">
                      {selectedCityWeather.error}
                    </div>
                  </div>
                </div>
              ) : selectedCityWeather?.forecast &&
                selectedCityWeather.forecast.length > 0 ? (
                <div className="space-y-3">
                  {selectedCityWeather.forecast.slice(1).map((day, index) => (
                    <div
                      key={index}
                      className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-5xl">
                            {getWeatherIcon(day.condition)}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-bold text-base mb-1">
                              {day.date}
                            </div>
                            <div className="text-white/90 text-sm capitalize mb-2">
                              {day.description}
                            </div>
                            <div className="flex items-center gap-4 text-white/80 text-xs">
                              <div className="flex items-center gap-1">
                                <span>💨</span>
                                <span>{day.windSpeed} km/h</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>💧</span>
                                <span>{day.humidity}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-white text-3xl font-bold">
                          {day.temp}°
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Attribution */}
                  <div className="mt-6 text-center">
                    <div className="text-white/60 text-xs">
                      Weather data by{" "}
                      <a
                        href="https://www.yr.no"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold hover:text-white/80 transition-colors"
                      >
                        MET Norway / yr.no
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white text-center">
                    <div className="text-lg font-semibold">
                      Loading weather data...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AppsLayout>
      );
    }

    // Main view: City cards
    return (
      <AppsLayout onClose={onClose} title="Weather">
        <div className="h-full flex flex-col bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 pt-30">
          {/* City Cards Grid */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {CITIES.map((city) => {
                const cityWeather = citiesWeather.find(
                  (c) => c.city === city.name
                );
                // Get today's forecast if available
                const todayForecast =
                  cityWeather?.forecast && cityWeather.forecast.length > 0
                    ? cityWeather.forecast[0]
                    : null;

                // Get gradient for card based on weather
                const getCardGradient = (condition: string) => {
                  const lowerCondition = condition?.toLowerCase() || "";
                  if (
                    lowerCondition.includes("clearsky") ||
                    lowerCondition.includes("sunny")
                  ) {
                    return "from-yellow-400/30 to-orange-400/30";
                  } else if (lowerCondition.includes("rain")) {
                    return "from-blue-500/30 to-indigo-600/30";
                  } else if (lowerCondition.includes("snow")) {
                    return "from-cyan-300/30 to-blue-400/30";
                  } else if (lowerCondition.includes("cloudy")) {
                    return "from-gray-400/30 to-gray-500/30";
                  }
                  return "from-white/20 to-white/10";
                };

                const cardGradient = todayForecast
                  ? getCardGradient(todayForecast.condition)
                  : "from-white/20 to-white/10";

                return (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city.name)}
                    className={`bg-gradient-to-br ${cardGradient} backdrop-blur-md rounded-2xl p-4 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 text-left`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="text-6xl mb-3 drop-shadow-lg">
                        {todayForecast
                          ? getWeatherIcon(todayForecast.condition)
                          : "🌤️"}
                      </div>
                      <div className="text-white font-bold text-lg mb-1 drop-shadow-sm">
                        {city.name}
                      </div>
                      <div className="text-white/80 text-xs mb-3 font-medium">
                        {city.country}
                      </div>
                      {todayForecast ? (
                        <>
                          <div className="text-white text-3xl font-bold mb-2 drop-shadow-sm">
                            {todayForecast.temp}°C
                          </div>
                          <div className="text-white/90 text-xs capitalize font-medium px-2 py-1 bg-white/20 rounded-full">
                            {todayForecast.description}
                          </div>
                        </>
                      ) : cityWeather?.loading ? (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-white/80 text-xs font-medium">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <div className="text-white/70 text-xs mt-2 font-medium">
                          Tap to view
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Attribution */}
            <div className="mt-6 text-center pb-4">
              <div className="text-white/70 text-xs">
                Weather data by{" "}
                <a
                  href="https://www.yr.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold hover:text-white/90 transition-colors"
                >
                  MET Norway / yr.no
                </a>
              </div>
            </div>
          </div>
        </div>
      </AppsLayout>
    );
  }

  return null;
};

export default Weather;
