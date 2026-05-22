/**
 * Conversão WGS84 -> UTM (zona 36/37, hemisfério sul).
 * Algoritmo de Snyder (USGS Bulletin 1532), suficiente para uso operacional.
 */
var GeoService = (function() {
  function wgs84ToUtm(lon, lat) {
    if (lon === '' || lat === '' || lon === null || lat === null) return { x: '', y: '', zone: '' };
    lon = Number(lon); lat = Number(lat);
    var a = 6378137.0, f = 1/298.257223563;
    var eSq = f * (2 - f);
    var ePrimeSq = eSq / (1 - eSq);
    var k0 = 0.9996;
    var zone = Math.floor((lon + 180) / 6) + 1;
    var lon0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;
    var phi = lat * Math.PI / 180;
    var lam = lon * Math.PI / 180;
    var N = a / Math.sqrt(1 - eSq * Math.sin(phi) * Math.sin(phi));
    var T = Math.tan(phi) * Math.tan(phi);
    var C = ePrimeSq * Math.cos(phi) * Math.cos(phi);
    var A = Math.cos(phi) * (lam - lon0);
    var M = a * ((1 - eSq/4 - 3*eSq*eSq/64 - 5*Math.pow(eSq,3)/256) * phi
                - (3*eSq/8 + 3*eSq*eSq/32 + 45*Math.pow(eSq,3)/1024) * Math.sin(2*phi)
                + (15*eSq*eSq/256 + 45*Math.pow(eSq,3)/1024) * Math.sin(4*phi)
                - 35*Math.pow(eSq,3)/3072 * Math.sin(6*phi));
    var x = k0 * N * (A + (1 - T + C) * Math.pow(A, 3)/6 + (5 - 18*T + T*T + 72*C - 58*ePrimeSq) * Math.pow(A,5)/120) + 500000;
    var y = k0 * (M + N * Math.tan(phi) * (A*A/2 + (5 - T + 9*C + 4*C*C) * Math.pow(A,4)/24 + (61 - 58*T + T*T + 600*C - 330*ePrimeSq) * Math.pow(A,6)/720));
    if (lat < 0) y += 10000000;
    return { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000, zone: zone + 'S' };
  }
  return { wgs84ToUtm: wgs84ToUtm };
})();
