import React, {useEffect} from "react"
import handleLine from "../data/geometry_data"

const Painter = (props) => {
    useEffect(()=>{
        if (!props.gl || !props.program) {
            console.log("Missing gl or program:", { gl: !!props.gl, program: !!props.program });
            return;
        }

        props.gl.useProgram(props.program);
        const positionBuffer = props.gl.createBuffer();
        props.gl.bindBuffer(props.gl.ARRAY_BUFFER, positionBuffer);
     
        let geometry_data = handleLine()
        console.log("now pringint jkalsdfj;asdklfl")
        console.log(geometry_data)
        props.gl.bufferData(props.gl.ARRAY_BUFFER, new Float32Array(geometry_data.vertices), props.gl.STATIC_DRAW);
        const positionAttributeLocation = props.gl.getAttribLocation(props.program, "a_position");
        props.gl.enableVertexAttribArray(positionAttributeLocation);


        const matrixLocation = props.gl.getUniformLocation(props.program, "u_matrix");
        props.gl.uniformMatrix3fv(matrixLocation, false, props.matrix);

        const size = 2;
        const type = props.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        let offset = 0; 
        props.gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const primitiveType = props.gl.TRIANGLES;
        offset = 0;
        const count = geometry_data.vertices.length / 2;
        props.gl.drawArrays(primitiveType, offset, count);


    }, [props.gl, props.program , props.matrix])

    return null
}

export default Painter


