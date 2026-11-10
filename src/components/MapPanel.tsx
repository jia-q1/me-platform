/**
 * Map of locations, drawn with Leaflet on an OpenStreetMap basemap.
 *
 * Pages only pass `points`; they don't know which map library is used. Keep these
 * props stable so the Impact Dashboard / Earth Engine layer can be added here later
 * without touching the pages.
 *
 * Before launch: OpenStreetMap borders are not the UN's official boundaries. Check
 * with UNDP which basemap to use (e.g. the UN Geospatial "Clear Map"); swapping it
 * only means changing TILE_URL and TILE_ATTRIBUTION below.
 */
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { num } from '../lib/format';

export interface MapPoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** Drives circle size. */
  value: number | null;
  group?: string;
  /** Optional link when the point is clicked. */
  to?: string;
}

const PALETTE = ['#0468B1', '#FD6925', '#00A3A1', '#7B4FA3', '#B8860B'];

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** With this many points or fewer, labels stay visible; with more, they show on hover. */
const ALWAYS_LABEL_MAX = 5;

type ValueFormat = (v: number | null) => string;

export function MapPanel({ points, sizeLabel, valueFormat = num }: { points: MapPoint[]; sizeLabel?: string; valueFormat?: ValueFormat }) {
  if (points.length === 0) {
    return <div className="map map-empty">No locations recorded yet.</div>;
  }

  const groups = [...new Set(points.map((p) => p.group ?? ''))];
  const color = (g?: string) => PALETTE[groups.indexOf(g ?? '') % PALETTE.length];
  const describe = (p: MapPoint) => `${p.label}${p.value != null ? `: ${valueFormat(p.value)}` : ''}`;

  return (
    <figure className="map">
      <div className="map-note">Map layer: Impact Dashboard / Earth Engine, to be connected</div>
      <LeafletMap points={points} color={color} describe={describe} />
      {/* The circles can't be reached by keyboard or screen reader, so list the links as well. */}
      <ul className="sr-only" aria-label="Locations on the map">
        {points.map((p) => (
          <li key={p.id}>{p.to ? <Link to={p.to}>{describe(p)}</Link> : describe(p)}</li>
        ))}
      </ul>
      <figcaption className="map-legend">
        {groups.filter(Boolean).map((g) => (
          <span key={g}>
            <i className="sw sw-round" style={{ background: color(g) }} />
            {g}
          </span>
        ))}
        {sizeLabel && <span className="muted">Circle size = {sizeLabel}</span>}
      </figcaption>
      <p className="map-disclaimer">
        The boundaries and names shown and the designations used on this map do not imply official endorsement or acceptance by the United Nations.
      </p>
    </figure>
  );
}

function LeafletMap({ points, color, describe }: { points: MapPoint[]; color: (g?: string) => string; describe: (p: MapPoint) => string }) {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, { scrollWheelZoom: false, worldCopyJump: true, minZoom: 1 });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // Keep tiles correct if the panel changes size (e.g. window resized).
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Redraw the circles whenever the points change (e.g. a filter on the page).
  const pointsKey = JSON.stringify(points);
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const maxVal = Math.max(1, ...points.map((p) => p.value ?? 0));
    const permanent = points.length <= ALWAYS_LABEL_MAX;

    for (const p of points) {
      const c = color(p.group);
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6 + Math.sqrt((p.value ?? 0) / maxVal) * 16,
        color: c,
        weight: 2,
        fillColor: c,
        fillOpacity: 0.3,
        className: p.to ? 'map-pt-link' : 'map-pt-static',
      });
      // Use textContent, not an HTML string, so names from the data can't inject markup.
      const tip = document.createElement('span');
      tip.textContent = permanent ? p.label : describe(p);
      marker.bindTooltip(tip, { permanent, direction: 'right', offset: [8, 0], className: 'map-tip' });
      if (p.to) {
        const to = p.to;
        marker.on('click', () => navigateRef.current(to));
      }
      layer.addLayer(marker);
    }

    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [48, 48], maxZoom: 6 });
    // `points` is covered by pointsKey; color and describe are derived from it.
  }, [pointsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="map-canvas" role="img" aria-label="Map of locations" />;
}
