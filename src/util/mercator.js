function webMercatorXfromLng(lng) {
    return (180 + lng) / 360;
  }

function webMercatorYfromLat(lat) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

export  function WebMercatorfromLngLat(lngLat) {
    let x = webMercatorXfromLng(lngLat[0]);
    let y = webMercatorYfromLat(lngLat[1]);
  
    x = -1 + (x * 2);
    y = 1 - (y * 2);
  
    return [x, y];
}


function lngFromMercatorX(x) {
  return x * 360 - 180;
}

function latFromMercatorY(y) {
  const y2 = 180 - y * 360;
  return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
}


export function fromXY(xy) {
  let [x, y] = xy;
  const lng = lngFromMercatorX((1 + x) / 2);
  const lat = latFromMercatorY((1 - y) / 2);
  return [lng, lat];
}