import earcut from 'earcut';
import {WebMercatorfromLngLat} from "../util/mercator"
import { norm } from 'mathjs';




function getVerticesFromCoordinates(coordinate){
  const flattened = [];
  coordinate.forEach(point => {
    flattened.push(...point);  
  });
  const triangles = earcut(flattened);
  const vertices = new Float32Array(triangles.length * 2);
  for (let i = 0; i < triangles.length; i++) {
    const point = triangles[i];
    const lng = flattened[point * 2];
    const lat = flattened[point * 2 + 1];
    const [x, y] = WebMercatorfromLngLat([lng, lat]);
    vertices[i * 2] = x;
    vertices[i * 2 + 1] = y;
  }
  return vertices
}

 export const  getBoundingBox = () =>{


        const line = [
          [2.81,7.36],
          [47.81,6.49],
          [22.68,-8.23],
          [-40.96,-12.04],
          [2.81,7.36],
          
        ];

       

        let newPosition = []
        newPosition.push(...getVerticesFromCoordinates(line))
       
       
        return {
            vertices: newPosition,
            
        };
     
    }

export const handleLine = () => {


  const coordinate = [
          [38.81551, 9.00382],
          [38.81431 , 9.02005],
          [38.83663 , 9.01869],
          [38.83581 , 9.03285 ],
          [38.82959 , 9.03243]
          // [-132.2,65.4],
          // [-0.4,68.5],
          // [12.0,-29.5],
          // [147.7,-32.5],
          // [116.0,23.9],
          // [-101.3,19.6]
  ]
  
 
  const mercatorPoints = coordinate.map(coord => WebMercatorfromLngLat(coord));
  
 
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  mercatorPoints.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.max(width, height);

  const points = [];
  mercatorPoints.forEach(([x, y]) => {
    const normalizedX = 2 * ((x - minX) / scale - 0.5);
    const normalizedY = 2 * ((y - minY) / scale - 0.5);
    points.push(normalizedX, normalizedY);
  });
 

  const lineData = []
  const normals = []
  const sides = []
  for (let i=0; i < points.length - 2; i+= 2){
        const x1 = points[i];
        const y1 = points[i + 1];
        const x2 = points[i + 2];
        const y2 = points[i + 3];

    
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len;
        const ny = dx / len;

        lineData.push(
          x1, y1,
          x1, y1,
          x2, y2,
          x2, y2
      );

      normals.push(
        nx, ny,
        nx, ny,
        nx, ny,
        nx, ny
    );

    sides.push(-1, 1, -1, 1);



  }

  const indices = [];
  for (let i = 0; i < (points.length - 2) / 2; i++) {
      const baseIndex = i * 4;
      indices.push(
        baseIndex, baseIndex + 1, baseIndex + 2,
        baseIndex + 1, baseIndex + 2, baseIndex + 3
      );
  }

  return {
    points : points , 
    lineData : lineData , 
    normals : normals , 
    sides : sides,
    indices : indices
  }

}