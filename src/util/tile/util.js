import {lngFromMercatorX,latFromMercatorY} from "../mercator"




const d2r = Math.PI / 180;
const r2d = 180 / Math.PI;

export function pointToTile(lon, lat, z) {
    const tile = pointToTileFraction(lon, lat, z);
    tile[0] = Math.floor(tile[0]);
    tile[1] = Math.floor(tile[1]);
    return tile;
}
  
 
 function pointToTileFraction(lon, lat, z) {
    const sin = Math.sin(lat * d2r);
    const z2 = Math.pow(2, z);
    let x = z2 * (lon / 360 + 0.5);
    const y = z2 * (0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI);
  
   
    x = x % z2;
    if (x < 0) x = x + z2;
    return [x, y, z];
}
