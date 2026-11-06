/**
 * Placeholder map. Plots points by latitude/longitude on a plain grid so the layout
 * and interactions can be reviewed now.
 *
 * TODO: replace the <svg> with a real basemap (Leaflet or MapLibre) and the Impact
 * Dashboard / Earth Engine layer. Keep the same props so pages don't change.
 */
import { useNavigate } from 'react-router';
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

export function MapPanel({ points, sizeLabel, valueFormat = num }: { points: MapPoint[]; sizeLabel?: string; valueFormat?: (v: number | null) => string }) {
  const navigate = useNavigate();
  const W = 760;
  const H = 360;

  if (points.length === 0) {
    return <div className="map map-empty">No locations recorded yet.</div>;
  }

  const groups = [...new Set(points.map((p) => p.group ?? ''))];
  const color = (g?: string) => PALETTE[groups.indexOf(g ?? '') % PALETTE.length];

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const padDeg = 4;
  const minLat = Math.min(...lats) - padDeg;
  const maxLat = Math.max(...lats) + padDeg;
  const minLng = Math.min(...lngs) - padDeg * 2;
  const maxLng = Math.max(...lngs) + padDeg * 2;
  const x = (lng: number) => 40 + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 80);
  const y = (lat: number) => 30 + ((maxLat - lat) / (maxLat - minLat || 1)) * (H - 60);
  const maxVal = Math.max(1, ...points.map((p) => p.value ?? 0));
  const r = (v: number | null) => 6 + Math.sqrt((v ?? 0) / maxVal) * 16;

  return (
    <figure className="map">
      <div className="map-note">Map layer: Impact Dashboard / Earth Engine, to be connected</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Map of locations">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={(W / 8) * i} x2={(W / 8) * i} y1="0" y2={H} stroke="#DCE6EF" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h${i}`} x1="0" x2={W} y1={(H / 4) * i} y2={(H / 4) * i} stroke="#DCE6EF" />
        ))}
        {points.map((p) => (
          <g
            key={p.id}
            className={p.to ? 'map-pt map-pt-link' : 'map-pt'}
            onClick={p.to ? () => navigate(p.to!) : undefined}
            onKeyDown={p.to ? (e) => e.key === 'Enter' && navigate(p.to!) : undefined}
            tabIndex={p.to ? 0 : undefined}
            role={p.to ? 'link' : undefined}
          >
            <title>{`${p.label}${p.value != null ? `: ${valueFormat(p.value)}` : ''}`}</title>
            <circle cx={x(p.lng)} cy={y(p.lat)} r={r(p.value)} fill={color(p.group)} fillOpacity="0.25" stroke={color(p.group)} strokeWidth="2" />
            <circle cx={x(p.lng)} cy={y(p.lat)} r="3.5" fill={color(p.group)} />
            {/* Put the label on the left for points near the right edge so it isn't cut off. */}
            <text
              x={x(p.lng) > W * 0.7 ? x(p.lng) - r(p.value) - 4 : x(p.lng) + r(p.value) + 4}
              y={y(p.lat) + 4}
              textAnchor={x(p.lng) > W * 0.7 ? 'end' : 'start'}
              fontSize="12"
              fontWeight="700"
              fill="#1F2328"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="map-legend">
        {groups.filter(Boolean).map((g) => (
          <span key={g}>
            <i className="sw sw-round" style={{ background: color(g) }} />
            {g}
          </span>
        ))}
        {sizeLabel && <span className="muted">Circle size = {sizeLabel}</span>}
      </figcaption>
    </figure>
  );
}
