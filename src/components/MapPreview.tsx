import { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
  className?: string;
};

type LoaderState = {
  promise: Promise<void> | null;
};

const loader: LoaderState = { promise: null };

function loadMapsJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.maps) return Promise.resolve();
  if (loader.promise) return loader.promise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  if (!key) return Promise.reject(new Error("Missing Google Maps browser key"));

  loader.promise = new Promise<void>((resolve, reject) => {
    (window as any).__sonntagInitMap = () => resolve();
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key,
      loading: "async",
      callback: "__sonntagInitMap",
    });
    if (channel) params.set("channel", channel);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return loader.promise;
}

export function MapPreview({ lat, lng, markers, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadMapsJs()
      .then(() => {
        if (cancelled || !ref.current) return;
        const gmaps = (window as any).google.maps;
        if (!mapRef.current) {
          mapRef.current = new gmaps.Map(ref.current, {
            center: { lat, lng },
            zoom: 14,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "greedy",
          });
        } else {
          mapRef.current.setCenter({ lat, lng });
        }

        for (const m of markerRefs.current) m.setMap(null);
        markerRefs.current = [];

        markerRefs.current.push(
          new gmaps.Marker({
            position: { lat, lng },
            map: mapRef.current,
            title: "Dein Standort",
          }),
        );
        for (const m of markers ?? []) {
          markerRefs.current.push(
            new gmaps.Marker({
              position: { lat: m.lat, lng: m.lng },
              map: mapRef.current,
              title: m.title,
            }),
          );
        }
      })
      .catch((err) => {
        console.error("MapPreview failed to load", err);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, markers]);

  return <div ref={ref} className={className} />;
}