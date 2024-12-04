export const getVertexShader = () => {
    const vertexShaderSource = `
        attribute vec2 a_position;

        uniform mat3 u_matrix; // 3 X 3 matrix
    
        void main() {
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;
        gl_Position = vec4(position, 0, 1);
        }
    `;
    return vertexShaderSource
}

export const getLineVertexShader = () => {
    const vertexShaderSource = `
   
    attribute vec2 a_position;
    attribute vec2 a_normal;
    attribute float a_side;
    
    uniform float u_width;
    uniform mat3 u_matrix;
    
    void main() {
        // Apply matrix transformation to the position first
        vec3 transformedPos = u_matrix * vec3(a_position, 1.0);
        
        // Calculate the normal in screen space
        vec2 transformedNormal = (u_matrix * vec3(a_normal, 0.0)).xy;
        
        // Add the normal offset
        vec2 position = transformedPos.xy + transformedNormal * u_width * a_side;
        
        gl_Position = vec4(position, 0.0, 1.0);
    }

    `
    return vertexShaderSource
}

