import { useState, useEffect } from 'react'
import { Search, MapPin, Wind, Droplets, Thermometer, Cloud } from 'lucide-react'
import './App.css'

interface Suggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false)
  const [displayLocationName, setDisplayLocationName] = useState('')

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Se a sugestão foi clicada (showSuggestions é false), não busca novamente
      if (city.trim().length < 2 || !showSuggestions) {
        if (city.trim().length < 2) setSuggestions([]);
        return;
      }

      setIsSearchingSuggestions(true);
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`
        );
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const citySuggestions = data.map((item: any) => ({
            name: item.name,
            country: item.country,
            state: item.state,
            lat: item.lat,
            lon: item.lon
          }));
          setSuggestions(citySuggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        // Silently fail for suggestions to not disrupt user experience
      } finally {
        setIsSearchingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [city]);

  const fetchWeather = async (cityName?: string, lat?: number, lon?: number) => {
    const targetCity = cityName || city;
    if (!targetCity.trim() && lat === undefined) return
    
    setLoading(true)
    setError('')
    setSuggestions([])
    setShowSuggestions(false)
    
    try {
      let url = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=pt_br&appid=${API_KEY}`;
      
      if (lat !== undefined && lon !== undefined) {
        url += `&lat=${lat}&lon=${lon}`;
      } else {
        url += `&q=${targetCity.trim()}`;
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Cidade não encontrada. Verifique o nome e tente novamente.')
      }

      const data = await response.json()
      setWeather(data)
      
      // Se tivermos um nome personalizado (do clique na sugestão), usamos ele. 
      // Caso contrário, usamos o que a API retornar.
      if (!cityName) {
        setDisplayLocationName(`${data.name}, ${data.sys.country}`)
        setCity(`${data.name}, ${data.sys.country}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao obter dados meteorológicos')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (s: Suggestion) => {
    const locationParts = [s.name];
    if (s.state) locationParts.push(s.state);
    if (s.country) locationParts.push(s.country);
    
    const fullName = locationParts.join(', ');
    
    // Primeiro limpamos TUDO para garantir que o useEffect não rode
    setShowSuggestions(false);
    setSuggestions([]);
    setCity(fullName);
    setDisplayLocationName(fullName);
    fetchWeather(fullName, s.lat, s.lon);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchWeather()
    }
  }

  return (
    <div className="container" onClick={() => setShowSuggestions(false)}>
      <div className="weather-card" onClick={(e) => e.stopPropagation()}>
      <header>
        <h1>Weather <span className="highlight">App</span></h1>
        <div className="search-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Cidade ou Cidade, País (ex: Rio, BR)"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyPress}
              onFocus={() => city.length >= 2 && setShowSuggestions(true)}
            />
            <button onClick={() => fetchWeather()} disabled={loading} className="btn-search">
              {loading || isSearchingSuggestions ? <div className="loader-small"></div> : <Search size={22} />}
            </button>
          </div>
          
          {showSuggestions && (suggestions.length > 0) && (
            <ul className="suggestions-list">
              {suggestions.map((s, index) => (
                <li key={index} onClick={() => handleSuggestionClick(s)}>
                  <MapPin size={14} />
                  <div className="suggestion-info">
                    <span className="suggestion-name">{s.name}</span>
                    <span className="suggestion-location">
                      {s.state ? `${s.state}, ` : ''}{s.country}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}

        {weather && (
          <main className="weather-content">
            <div className="city-header">
              <MapPin size={18} />
              <h2>{displayLocationName}</h2>
            </div>

            <div className="main-info">
              <div className="temp-display">
                <img
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt={weather.weather[0].description}
                />
                <div className="temp-value">
                  <span className="number">{Math.round(weather.main.temp)}</span>
                  <span className="unit">°C</span>
                </div>
              </div>
              <p className="description">{weather.weather[0].description}</p>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <Thermometer size={20} />
                <div className="detail-text">
                  <span>Sensação</span>
                  <strong>{Math.round(weather.main.feels_like)}°C</strong>
                </div>
              </div>
              <div className="detail-item">
                <Droplets size={20} />
                <div className="detail-text">
                  <span>Umidade</span>
                  <strong>{weather.main.humidity}%</strong>
                </div>
              </div>
              <div className="detail-item">
                <Wind size={20} />
                <div className="detail-text">
                  <span>Vento</span>
                  <strong>{Math.round(weather.wind.speed * 3.6)} km/h</strong>
                </div>
              </div>
              <div className="detail-item">
                <Cloud size={20} />
                <div className="detail-text">
                  <span>Pressão</span>
                  <strong>{weather.main.pressure} hPa</strong>
                </div>
              </div>
            </div>
          </main>
        )}

        {!weather && !loading && !error && (
          <div className="empty-state">
            <Cloud size={64} className="cloud-icon" />
            <p>Descubra o clima em qualquer lugar do mundo.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
