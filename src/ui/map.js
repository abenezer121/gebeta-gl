import React, { useEffect, useState, useRef, useCallback } from "react";
import { setUpWebGL } from "../util/webgl/setup";
import Painter from "../render/painter.js"
import { getFragmentShader } from "../shader/fragmentShader.js";
import { getVertexShader , getLineVertexShader } from "../shader/vertexShader.js";
import { createShader } from "../shader/shader.js";
import { mat3, vec3 } from 'gl-matrix';
import {lngFromMercatorX , latFromMercatorY , fromXY} from "./../util/mercator.js"
import {pointToTile} from "./../util/tile/util.js"
const Map = (props) => {
  const [gl, setGl] = useState(null);
  const [camera, setCamera] = useState({ x: 0.21486253944444456, y: 0.05057221386852884, z: 14 });
  // const [camera, setCamera] = useState({ x: 0, y: 0, z: 0 });

  const [matrix, setMatrix] = useState([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  const [program, setProgram] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
 const [positionBuffer , setPositionBuffer] = useState(null)


  const canvasRef = useRef(null);

  // shitty react wont wait for the camera state to update yiramedal
  const updateProjectionMatrix = useCallback((_camera) => {
    let cameraMatrix = mat3.create();
    mat3.translate(cameraMatrix, cameraMatrix, [_camera.x, _camera.y]);
    const scale = 1 / Math.pow(2, _camera.z);
    mat3.scale(cameraMatrix, cameraMatrix, [scale, scale]);

    let projectionMatrix = mat3.multiply(
      [],
      mat3.create(),
      mat3.invert([], cameraMatrix)
    );
    setMatrix(projectionMatrix);
  }, []);

  function getMousePositionInClipSpace(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const normalizedX = mouseX / canvas.clientWidth;
    const normalizedY = mouseY / canvas.clientHeight;

    const clipX = normalizedX * 2 - 1;
    const clipY = normalizedY * -2 + 1;

    return { x: clipX, y: clipY };
  }

  
  // get the tiles 
  useEffect(() => {
    let TILE_SIZE = 4096
    const MAX_TILE_ZOOM = 18;
    const canvas = document.getElementById("gebeta-web-gl");
    if (!canvas) return;
    
    const zoomScale = Math.pow(2, camera.z);
    
    const px = (1 + camera.x) / 2;
    const py = (1 - camera.y) / 2;

    const wx = px * TILE_SIZE;
    const wy = py * TILE_SIZE;

    // get zoom px
    const zx = wx * zoomScale;
    const zy = wy * zoomScale;
    
    // get bottom-left and top-right pixels
    let x1 = zx - (canvas.width / 2);
    let y1 = zy + (canvas.height / 2);
    let x2 = zx + (canvas.width / 2);
    let y2 = zy - (canvas.height / 2);

    // convert to world coords
    x1 = x1 / zoomScale / TILE_SIZE;
    y1 = y1 / zoomScale / TILE_SIZE;
    x2 = x2 / zoomScale / TILE_SIZE;
    y2 = y2 / zoomScale / TILE_SIZE;
    
    const bbox = [
      lngFromMercatorX(x1),
      latFromMercatorY(y1),
      lngFromMercatorX(x2),
      latFromMercatorY(y2)
    ];
    
    const z = Math.min(Math.trunc(camera.z), MAX_TILE_ZOOM);
    const minTile = pointToTile(bbox[0], bbox[3], z); // top-left
    const maxTile = pointToTile(bbox[2], bbox[1], z); // bottom-right
    
    
    // tiles visible in viewport
    let tilesInView = [];
    const [minX, maxX] = [Math.max(minTile[0], 0), maxTile[0]];
    const [minY, maxY] = [Math.max(minTile[1], 0), maxTile[1]];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tilesInView.push([x, y, z]);
      }
    }
    // setTileToAsk(tilesInView)
 
  
    console.log(fromXY([camera.x , camera.y]))
    console.log(tilesInView)

}, [camera]);


  useEffect(() => {
    let glContext = setUpWebGL("gebeta-web-gl");
    if (glContext != null) {
      glContext.viewport(0, 0, glContext.canvas.width, glContext.canvas.height);
      let fragmentShaderSource = getFragmentShader();
      let vertexShaderSource = getLineVertexShader();

      const vertexShader = createShader(glContext, glContext.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(glContext, glContext.FRAGMENT_SHADER, fragmentShaderSource);


      if (!glContext.getShaderParameter(vertexShader, glContext.COMPILE_STATUS)) {
        console.error("Vertex shader compilation error:", glContext.getShaderInfoLog(vertexShader));
        return;
      }
      if (!glContext.getShaderParameter(fragmentShader, glContext.COMPILE_STATUS)) {
        console.error("Fragment shader compilation error:", glContext.getShaderInfoLog(fragmentShader));
        return;
      }
      
      const shaderProgram = glContext.createProgram();
      glContext.attachShader(shaderProgram, vertexShader);
      glContext.attachShader(shaderProgram, fragmentShader);

      
      glContext.linkProgram(shaderProgram);
      if (!glContext.getProgramParameter(shaderProgram, glContext.LINK_STATUS)) {
        console.error("Program linking error:", glContext.getProgramInfoLog(shaderProgram));
      }
      
      setProgram(shaderProgram);
    }
    updateProjectionMatrix(camera);
    setGl(glContext);
  }, [updateProjectionMatrix, camera]);

  useEffect(() => {
    const canvas = document.getElementById("gebeta-web-gl");

    const handleWheel = (event) => {
      event.preventDefault();
      const mousePos = getMousePositionInClipSpace(event, canvas);

      const [preZoomX, preZoomY] = vec3.transformMat3(
        [],
        [mousePos.x, mousePos.y, 0],
        mat3.invert([], matrix)
      );

      const zoomDelta = -event.deltaY * (1 / 300);
      const newZoom = Math.max(props.minZoom, Math.min(camera.z + zoomDelta, props.maxZoom));
      
      
      const tempMatrix = mat3.create();
      mat3.translate(tempMatrix, tempMatrix, [camera.x, camera.y]);
      const scale = 1 / Math.pow(2, newZoom);
      mat3.scale(tempMatrix, tempMatrix, [scale, scale]);
      const tempProjection = mat3.multiply(
        [],
        mat3.create(),
        mat3.invert([], tempMatrix)
      );

      const [postZoomX, postZoomY] = vec3.transformMat3(
        [],
        [mousePos.x, mousePos.y, 0],
        mat3.invert([], tempProjection)
      );

      const newCamera = {
        x: camera.x + (preZoomX - postZoomX),
        y: camera.y + (preZoomY - postZoomY),
        z: newZoom
      };

      setCamera(newCamera);
      updateProjectionMatrix(newCamera);

     
    };

    if (canvas) {
      canvas.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [camera, matrix, updateProjectionMatrix]);

  useEffect(() => {
    const canvas = document.getElementById("gebeta-web-gl");
    if (!canvas) return;

    const handleMouseDown = (event) => {
      const pos = getMousePositionInClipSpace(event, canvas);
      setStartPos(pos);
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;

      const currentPos = getMousePositionInClipSpace(event, canvas);

     
      const [preX, preY] = vec3.transformMat3(
        [],
        [startPos.x, startPos.y, 0],
        mat3.invert([], matrix)
      );

     
      const [postX, postY] = vec3.transformMat3(
        [],
        [currentPos.x, currentPos.y, 0],
        mat3.invert([], matrix)
      );

      
      const deltaX = preX - postX;
      const deltaY = preY - postY;

      if (isNaN(deltaX) || isNaN(deltaY)) return;

      
      const newCamera = {
        x: camera.x + deltaX,
        y: camera.y + deltaY,
        z: camera.z
      };

      setCamera(newCamera);
      updateProjectionMatrix(newCamera);
      setStartPos(currentPos);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, startPos, matrix, camera, updateProjectionMatrix]);


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <canvas 
        ref={canvasRef} 
        id="gebeta-web-gl" 
        
        width={props.width} 
        height={props.height}
      ></canvas>
      {gl && <Painter  gl={gl} camera={camera} matrix={matrix} program={program} positionBuffer={positionBuffer} />}
    </div>
  );
  
};

export default Map;