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

    uniform float u_zoom;           // current zoom level
    uniform vec2 u_viewport_size;


    const float SCALE_FACTOR = 0.03;    // Adjust this to control overall line thickness
    const float MIN_WIDTH = 0.5;        // Minimum line width
    const float MAX_WIDTH = 5.0;        // Maximum line width

    varying float v_edge;
    void main() {

        // Calculate zoom-based scale factor
        float zoom_scale = exp2(u_zoom) * SCALE_FACTOR;
        
        // Calculate pixel ratio for consistent width across devices
        float pixel_ratio = 2.0 / min(u_viewport_size.x, u_viewport_size.y);
        
        // Calculate final width with zoom-dependent scaling
        float width = clamp(u_width * zoom_scale, MIN_WIDTH, MAX_WIDTH) * pixel_ratio;
        
        
        // Apply matrix transformation to the position first
        vec3 transformedPos = u_matrix * vec3(a_position, 1.0);
        
        // Calculate the normal in screen space
        vec2 transformedNormal = (u_matrix * vec3(a_normal, 0.0)).xy;
        
        // Add the normal offset
        vec2 position = transformedPos.xy + transformedNormal * u_width * a_side;
        v_edge = a_side;
        gl_Position = vec4(position, 0.0, 1.0);
    }

    `
    return vertexShaderSource
}

