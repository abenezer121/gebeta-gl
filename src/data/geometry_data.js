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

    export const handleLine = (zoom, geojsonData) => {

  const coordinate = [];
  
    
  if (geojsonData && geojsonData.features) {
    geojsonData.features.forEach(feature => {
     
      if (feature.type === "2") {
   
        for(let i =0; i < feature.geometry.length; i++){
          let point = []
          for(let j =0 ; j < feature.geometry[i].point.length; j++){
           
            point.push([feature.geometry[i].point[j].x , feature.geometry[i].point[j].y]);
          }
          coordinate.push(point);
      }
    }else if (feature.type === "3"){
      for(let i =0; i < feature.geometry.length; i++){
        let point = []
        for(let j =0 ; j < feature.geometry[i].point.length; j++){
         
          point.push([feature.geometry[i].point[j].x , feature.geometry[i].point[j].y]);
        }
        coordinate.push(point);
    }
      }
        
  
    });
  }
 
  // if (geojsonData && geojsonData.features) {
  //   geojsonData.features.forEach(feature => {
  //     if (feature.type === 2) {
  //       for(let i =0; i < feature.geometry.length; i++){
  //         coordinate.push(feature.geometry[i]);
  //       }
        
  //     }
  //   });
  // }

  const allLineData = [];
  const allNormals = [];
  const allSides = [];
  const allIndices = [];
  
  let globalPointIndex = 0; 

  coordinate.forEach(line => {
    const points = [];
   
    line.forEach(coord => {
      // const [x, y] = WebMercatorfromLngLat(coord); 
      let x = coord[0]
      let y = coord[1]
      x = -1 + (x * 2);
      y = 1 - (y * 2);
      // console.log(x)
      // console.log(y)
      points.push(x, y);
    });

    const lineData = [];
    const normals = [];
    const sides = [];
    const indices = [];

    for (let i = 0; i < points.length - 2; i += 2) {
      const x1 = points[i];
      const y1 = points[i + 1];
      const x2 = points[i + 2];
      const y2 = points[i + 3];

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dy / len;
      const ny = -dx / len;

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

    for (let i = 0; i < (lineData.length / 4) - 1; i++) {
      const baseIndex = i * 4 + globalPointIndex;
      indices.push(
        baseIndex, baseIndex + 1, baseIndex + 2,
        baseIndex + 1, baseIndex + 2, baseIndex + 3
      );
    }

    globalPointIndex += lineData.length / 2;

    allLineData.push(...lineData);
    allNormals.push(...normals);
    allSides.push(...sides);
    allIndices.push(...indices);
  });

  return {
    points: allLineData,  
    lineData: allLineData, 
    normals: allNormals,
    sides: allSides,
    indices: allIndices
  };
}

