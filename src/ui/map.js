import React, { useEffect, useState, useRef, useCallback } from "react";
import { setUpWebGL } from "../util/webgl/setup";
import Painter from "../render/painter.js"
import { getFragmentShader } from "../shader/fragmentShader.js";
import { getVertexShader , getLineVertexShader } from "../shader/vertexShader.js";
import { createShader } from "../shader/shader.js";
import { mat3, vec3 } from 'gl-matrix';

const Map = (props) => {
  const [gl, setGl] = useState(null);
  // const [camera, setCamera] = useState({ x: 0.21571994444444442, y: 0.05038931492117216, z: 16 });
  const [camera, setCamera] = useState({ x: 0, y: 0, z: 0 });
  
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

      event.preventDefault();
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
      {gl && <Painter gl={gl} camera={camera} matrix={matrix} program={program} positionBuffer={positionBuffer} />}
    </div>
  );
  
};

export default Map;