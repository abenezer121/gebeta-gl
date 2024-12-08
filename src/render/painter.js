import React, {useEffect , useRef , useCallback} from "react"
import {handleLine} from "../data/geometry_data"
import {getBoundingBox} from "../data/geometry_data" 


const Painter = (props) => {

  const buffersInitialized = useRef(false);
  const geometryDataRef = useRef(null);
  const positionBufferRef = useRef(null);
  const normalBufferRef = useRef(null);
  const sideBufferRef = useRef(null);
  const indexBufferRef = useRef(null);

  const initBuffers = useCallback(() => {
      if (!props.gl || buffersInitialized.current) return;
      
      positionBufferRef.current = props.gl.createBuffer();
      normalBufferRef.current = props.gl.createBuffer();
      sideBufferRef.current = props.gl.createBuffer();
      indexBufferRef.current = props.gl.createBuffer();
      
      buffersInitialized.current = true;
  }, [props.gl]);

  const updateBuffers = useCallback((geometry_data) => {
      if (!props.gl || !props.program) return;

      props.gl.useProgram(props.program);

      const positionAttributeLocation = props.gl.getAttribLocation(props.program, "a_position");
      const normalLocation = props.gl.getAttribLocation(props.program, 'a_normal');
      const sideLocation = props.gl.getAttribLocation(props.program, 'a_side');
      const widthLocation = props.gl.getUniformLocation(props.program, 'u_width');

    
      props.gl.bindBuffer(props.gl.ARRAY_BUFFER, positionBufferRef.current);
      props.gl.bufferData(props.gl.ARRAY_BUFFER, new Float32Array(geometry_data.lineData), props.gl.STATIC_DRAW);
      props.gl.enableVertexAttribArray(positionAttributeLocation);
      props.gl.vertexAttribPointer(positionAttributeLocation, 2, props.gl.FLOAT, false, 0, 0);

    
      props.gl.bindBuffer(props.gl.ARRAY_BUFFER, normalBufferRef.current);
      props.gl.bufferData(props.gl.ARRAY_BUFFER, new Float32Array(geometry_data.normals), props.gl.STATIC_DRAW);
      props.gl.enableVertexAttribArray(normalLocation);
      props.gl.vertexAttribPointer(normalLocation, 2, props.gl.FLOAT, false, 0, 0);

      // Update side buffer
      props.gl.bindBuffer(props.gl.ARRAY_BUFFER, sideBufferRef.current);
      props.gl.bufferData(props.gl.ARRAY_BUFFER, new Float32Array(geometry_data.sides), props.gl.STATIC_DRAW);
      props.gl.enableVertexAttribArray(sideLocation);
      props.gl.vertexAttribPointer(sideLocation, 1, props.gl.FLOAT, false, 0, 0);

      // Update index buffer
      props.gl.bindBuffer(props.gl.ELEMENT_ARRAY_BUFFER, indexBufferRef.current);
      props.gl.bufferData(props.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry_data.indices), props.gl.STATIC_DRAW);

      return geometry_data.indices.length;
  }, [props.gl, props.program]);

  const render = useCallback((indexCount) => {
      if (!props.gl || !props.program) return;

      props.gl.useProgram(props.program);

      const matrixLocation = props.gl.getUniformLocation(props.program, "u_matrix");
      const widthLocation = props.gl.getUniformLocation(props.program, "u_width");

      const canvasWidth = props.gl.canvas.width;
      const canvasHeight = props.gl.canvas.height;
      const scale = 1 / Math.pow(2, props.camera.z);
      const dynamicWidth = (canvasWidth + canvasHeight) * scale * 0.00001;

      props.gl.uniform1f(widthLocation, dynamicWidth);
      props.gl.uniformMatrix3fv(matrixLocation, false, props.matrix);

      props.gl.drawElements(props.gl.TRIANGLES, indexCount, props.gl.UNSIGNED_SHORT, 0);
  }, [props.gl, props.program, props.matrix, props.camera.z]);

  useEffect(() => {
      const fetchGeoJSON = async () => {
          if (!geometryDataRef.current) {
              try {
                  const response = await fetch('/map.geojson');
                  if (response.ok) {
                      const data = await response.json();
                      geometryDataRef.current = data;
                  }
              } catch (error) {
                  console.error('Error fetching GeoJSON:', error);
                  return;
              }
          }

          if (!props.gl || !props.program) return;

          initBuffers();
          const geometry_data = handleLine(props.camera.z, geometryDataRef.current);
          const indexCount = updateBuffers(geometry_data);
          render(indexCount);
      };

      fetchGeoJSON();

      return () => {
          if (props.gl && buffersInitialized.current) {
              props.gl.deleteBuffer(positionBufferRef.current);
              props.gl.deleteBuffer(normalBufferRef.current);
              props.gl.deleteBuffer(sideBufferRef.current);
              props.gl.deleteBuffer(indexBufferRef.current);
              buffersInitialized.current = false;
          }
      };
  }, [props.gl, props.program, props.matrix, props.camera.z, initBuffers, updateBuffers, render]);

  return null;
};

export default Painter



