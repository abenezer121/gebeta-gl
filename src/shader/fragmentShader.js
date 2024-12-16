export const getFragmentShader = () => {
    const fragmentShaderSource =`
      precision mediump float;
      varying float v_edge;
      void main() {
        vec4 roadColor = vec4(0.85, 0.85, 0.85, 1.0);
      
      // Slightly darker edges
      float edgeFactor = smoothstep(0.8, 1.0, abs(v_edge));
      vec4 edgeColor = vec4(0.75, 0.75, 0.75, 1.0);
      
      // Mix the colors based on the edge factor
      gl_FragColor = mix(roadColor, edgeColor, edgeFactor);
      }
  `;
    return fragmentShaderSource
}

