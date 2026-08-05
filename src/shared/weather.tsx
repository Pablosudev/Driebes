import { useEffect, useState } from "react";
import {
  WiDayCloudyHigh,
  WiDayFog,
  WiDayRain,
  WiDaySnow,
  WiDaySprinkle,
  WiDayStormShowers,
  WiDaySunny,
  WiDayThunderstorm,
} from "react-icons/wi";

const DRIEBES_COORDS = { latitude: 40.2447, longitude: -3.0413 };

const WEATHER_CODES: Record<number, { label: string; Icon: typeof WiDaySunny }> = {
  0: { label: "Despejado", Icon: WiDaySunny },
  1: { label: "Poco nuboso", Icon: WiDaySunny },
  2: { label: "Parcialmente nublado", Icon: WiDayCloudyHigh },
  3: { label: "Nublado", Icon: WiDayCloudyHigh },
  45: { label: "Niebla", Icon: WiDayFog },
  48: { label: "Niebla", Icon: WiDayFog },
  51: { label: "Llovizna", Icon: WiDaySprinkle },
  53: { label: "Llovizna", Icon: WiDaySprinkle },
  55: { label: "Llovizna", Icon: WiDaySprinkle },
  61: { label: "Lluvia", Icon: WiDayRain },
  63: { label: "Lluvia", Icon: WiDayRain },
  65: { label: "Lluvia", Icon: WiDayRain },
  71: { label: "Nieve", Icon: WiDaySnow },
  73: { label: "Nieve", Icon: WiDaySnow },
  75: { label: "Nieve", Icon: WiDaySnow },
  80: { label: "Chubascos", Icon: WiDayStormShowers },
  81: { label: "Chubascos", Icon: WiDayStormShowers },
  82: { label: "Chubascos", Icon: WiDayStormShowers },
  95: { label: "Tormenta", Icon: WiDayThunderstorm },
  96: { label: "Tormenta", Icon: WiDayThunderstorm },
  99: { label: "Tormenta", Icon: WiDayThunderstorm },
};

interface WeatherResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
  current_units: {
    temperature_2m: string;
  };
}

export default function Weather() {
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [unidad, setUnidad] = useState<string>("°C");
  const [codigo, setCodigo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      latitude: DRIEBES_COORDS.latitude.toString(),
      longitude: DRIEBES_COORDS.longitude.toString(),
      current: "temperature_2m,weather_code",
      temperature_unit: "celsius",
    });

    fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo obtener la temperatura.");
        }
        return response.json() as Promise<WeatherResponse>;
      })
      .then((data) => {
        setTemperatura(Math.round(data.current.temperature_2m));
        setUnidad(data.current_units.temperature_2m);
        setCodigo(data.current.weather_code);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Ha ocurrido un error inesperado."
        );
      });

    return () => controller.abort();
  }, []);

  if (error) {
    return <p className="font-body text-sm text-secondary-500">{error}</p>;
  }

  if (temperatura === null || codigo === null) {
    return (
      <p className="font-body text-sm text-secondary-500">
        Cargando temperatura...
      </p>
    );
  }

  const { label, Icon } = WEATHER_CODES[codigo] ?? {
    label: "Sin datos",
    Icon: WiDaySunny,
  };

  return (
    <div className="flex items-center gap-2 rounded-xl bg-tertiary-100 px-4 py-2.5">
      <Icon className="h-8 w-8 text-neutral-700" aria-hidden="true" />
      <div className="leading-tight">
        <p className="font-label text-label text-neutral">
          {temperatura}
          {unidad}
        </p>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-secondary-500">
          {label}
        </p>
      </div>
    </div>
  );
}