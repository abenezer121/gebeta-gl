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

export function handleLine(){
  const lineCoordinates = [
      [38.81551, 9.00382],
      [38.81431 , 9.02005],
      [38.83663 , 9.01869],
      [38.83581 , 9.03285 ],
      [38.82959 , 9.03243]
  ];
  const mercatoredLine = []
  const point = []
  for (let i =0; i < lineCoordinates.length; i++){
    const [x, y] = WebMercatorfromLngLat([lineCoordinates[i][0], lineCoordinates[i][1]]);
    mercatoredLine.push(x,y)
    point.push(x)
    point.push(y)
    
  }

  const lineData = []
  const normals = []
  const sides = []

  for (let i = 0; i < mercatoredLine.length - 2; i+=2){
    const x1 = mercatoredLine[i];
    const y1 = mercatoredLine[i + 1];
    const x2 = mercatoredLine[i + 2];
    const y2 = mercatoredLine[i + 3];

     // Calculate normal
     const dx = x2 - x1;
     const dy = y2 - y1;
     const len = Math.sqrt(dx * dx + dy * dy);
     const nx = -dy / len;
     const ny = dx / len;

      // Add vertices for quad (two triangles)
      lineData.push(
        x1, y1,
        x1, y1,
        x2, y2,
        x2, y2
    );

    // Add normals
    normals.push(
        nx, ny,
        nx, ny,
        nx, ny,
        nx, ny
    );

    // Add sides (-1 for left, 1 for right)
    sides.push(-1, 1, -1, 1);
  }
  return {
    sides : sides , 
    normals : normals , 
    lineData : lineData,
    point : point
  }

}

 function getBoundingBox(){


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


export default getBoundingBox