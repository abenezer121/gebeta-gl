

export const setUpWebGL = (canvasId) => {
    const canvas = document.getElementById(canvasId)
    const gl = canvas.getContext("webgl")
    if (gl == null) {
        return null
    }
    // gl.clearColor(1.0,1.0,1.0,1)
    // gl.clear(gl.COLOR_BUFFER_BIT)
    return  gl
}