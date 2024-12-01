export const getFragmentShader = () => {
    const fragmentShaderSource =`
      precision mediump float;

      void main() {
        gl_FragColor = vec4(0.4, 0.3, 0.1, 0.5);
      }
  `;
    return fragmentShaderSource
}
