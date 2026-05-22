/** Conversão WGS84 -> UTM (Snyder USGS, zona automática). */
export function wgs84ToUtm(lon, lat) {
  if (lon === '' || lat === '') return { x: '', y: '', zone: '' };
  lon = Number(lon); lat = Number(lat);
  const a = 6378137.0, f = 1/298.257223563;
  const eSq = f * (2 - f);
  const ePrimeSq = eSq / (1 - eSq);
  const k0 = 0.9996;
  const zone = Math.floor((lon + 180) / 6) + 1;
  const lon0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const lam = lon * Math.PI / 180;
  const N = a / Math.sqrt(1 - eSq * Math.sin(phi) ** 2);
  const T = Math.tan(phi) ** 2;
  const C = ePrimeSq * Math.cos(phi) ** 2;
  const A = Math.cos(phi) * (lam - lon0);
  const M = a * ((1 - eSq/4 - 3*eSq*eSq/64 - 5*eSq**3/256) * phi
              - (3*eSq/8 + 3*eSq*eSq/32 + 45*eSq**3/1024) * Math.sin(2*phi)
              + (15*eSq*eSq/256 + 45*eSq**3/1024) * Math.sin(4*phi)
              - 35*eSq**3/3072 * Math.sin(6*phi));
  const x = k0 * N * (A + (1 - T + C) * A**3/6 + (5 - 18*T + T*T + 72*C - 58*ePrimeSq) * A**5/120) + 500000;
  let y = k0 * (M + N * Math.tan(phi) * (A*A/2 + (5 - T + 9*C + 4*C*C) * A**4/24 + (61 - 58*T + T*T + 600*C - 330*ePrimeSq) * A**6/720));
  if (lat < 0) y += 10000000;
  return { x: Math.round(x*1000)/1000, y: Math.round(y*1000)/1000, zone: `${zone}S` };
}
