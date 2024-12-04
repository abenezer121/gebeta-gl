import React, {useEffect} from "react"
import {handleLine} from "../data/geometry_data"
import {getBoundingBox} from "../data/geometry_data" 
const Painter = (props) => {
    useEffect(()=>{
        if (!props.gl || !props.program) {
            console.log("Missing gl or program:", { gl: !!props.gl, program: !!props.program });
            return;
        }


        let geometry_data = handleLine()
      console.log(geometry_data)
        props.gl.useProgram(props.program);

          // Get attribute locations
          const positionAttributeLocation = props.gl.getAttribLocation(props.program, "a_position");
          const normalLocation = props.gl.getAttribLocation(props.program, 'a_normal');
          const sideLocation = props.gl.getAttribLocation(props.program, 'a_side');
          const widthLocation = props.gl.getUniformLocation(props.program, 'u_width');
          
          console.log("Attribute locations:", {
            position: positionAttributeLocation,
            normal: normalLocation,
            side: sideLocation,
            width: widthLocation
        });

        if (positionAttributeLocation === -1) {
            console.error("Failed to get a_position location");
            return;
        }
        if (normalLocation === -1) {
            console.error("Failed to get a_normal location");
            return;
        }
        if (sideLocation === -1) {
            console.error("Failed to get a_side location");
            return;
        }
        if (!widthLocation) {
            console.error("Failed to get u_width location");
            return;
        }

          // Create and bind position buffer
        const positionBuffer = props.gl.createBuffer();
        props.gl.bindBuffer(props.gl.ARRAY_BUFFER, positionBuffer);
        props.gl.bufferData(props.gl.ARRAY_BUFFER, new Float32Array(geometry_data.lineData), props.gl.STATIC_DRAW);
        props.gl.enableVertexAttribArray(positionAttributeLocation);
        props.gl.vertexAttribPointer(positionAttributeLocation, 2, props.gl.FLOAT, false, 0, 0);
         
        // Create and bind normal buffer
        const normalBuffer = props.gl.createBuffer();
        props.gl.bindBuffer(props.gl.ARRAY_BUFFER, normalBuffer);
        props.gl.bufferData(props.gl.ARRAY_BUFFER, new Float32Array(geometry_data.normals), props.gl.STATIC_DRAW);
        props.gl.enableVertexAttribArray(normalLocation);
        props.gl.vertexAttribPointer(normalLocation, 2, props.gl.FLOAT, false, 0, 0);
 
       // Create and bind side buffer
       const sideBuffer = props.gl.createBuffer();
       props.gl.bindBuffer(props.gl.ARRAY_BUFFER, sideBuffer);
       props.gl.bufferData(props.gl.ARRAY_BUFFER, new Float32Array(geometry_data.sides), props.gl.STATIC_DRAW);
       props.gl.enableVertexAttribArray(sideLocation);
       props.gl.vertexAttribPointer(sideLocation, 1, props.gl.FLOAT, false, 0, 0);
       
       // Create and bind index buffer
        const indexBuffer = props.gl.createBuffer();
        props.gl.bindBuffer(props.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        props.gl.bufferData(props.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry_data.indices), props.gl.STATIC_DRAW);

        const matrixLocation = props.gl.getUniformLocation(props.program, "u_matrix");
        props.gl.uniform1f(widthLocation, 0.01);
        props.gl.uniformMatrix3fv(matrixLocation, false, props.matrix);

        
        
       
        // Drawm,
        const primitiveType = props.gl.TRIANGLES;
        const offset = 0;
        const count = geometry_data.indices.length;
        props.gl.drawElements(primitiveType, count, props.gl.UNSIGNED_SHORT, offset);



    }, [props.gl, props.program , props.matrix])

    return null
}

export default Painter


