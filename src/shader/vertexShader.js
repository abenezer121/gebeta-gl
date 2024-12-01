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