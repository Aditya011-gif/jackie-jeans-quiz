"use client";

import { useEffect, useRef } from "react";

export default function VoiceShader({ active = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = aVertexPosition;
        v_texCoord = aTextureCoord;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_active;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;

        float d = length(uv);
        
        // Ambient pulse
        float pulse = 0.5 + 0.1 * sin(u_time * 2.0);
        if (u_active > 0.5) {
          pulse = 0.5 + 0.25 * sin(u_time * 6.0) * cos(u_time * 3.0);
        }
        
        // Sharp, thin rings
        float ring1 = smoothstep(0.4, 0.402, d) - smoothstep(0.405, 0.407, d);
        float ring2 = (smoothstep(0.45 * pulse, 0.45 * pulse + 0.005, d) - smoothstep(0.45 * pulse + 0.01, 0.45 * pulse + 0.015, d)) * 0.7;
        
        // Vertical wave spikes for voice amplitude
        float angle = atan(uv.y, uv.x);
        float spikes = 0.0;
        if (u_active > 0.5) {
          spikes = sin(angle * 30.0 + u_time * 8.0) * 0.06 * sin(u_time * 4.0);
        } else {
          spikes = sin(angle * 10.0 + u_time * 2.0) * 0.01 * sin(u_time * 0.5);
        }
        float waveGlow = 0.01 / abs(d - 0.35 + spikes);

        // Technical Noir Palette
        vec3 pureBlack = vec3(0.0);
        vec3 denimBlue = vec3(0.29, 0.435, 0.647); // #4a6fa5
        vec3 pureWhite = vec3(1.0);

        vec3 color = pureBlack;
        color += denimBlue * waveGlow * 1.5;
        color += pureWhite * ring1 * 0.8;
        color += denimBlue * ring2 * 0.6;
        
        // Vignette for depth
        float alpha = smoothstep(0.9, 0.3, d);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    function loadShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader link error:", gl.getProgramInfoLog(program));
      return;
    }

    const positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
    const texCoordAttributeLocation = gl.getAttribLocation(program, "aTextureCoord");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const activeUniformLocation = gl.getUniformLocation(program, "u_active");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    const texCoords = [
      0.0, 1.0,
      1.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    let animationFrameId;
    const startTime = Date.now();

    function render() {
      if (!canvas || !gl) return;

      // Adjust dimensions
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // Pass time
      const elapsedSeconds = (Date.now() - startTime) / 1000.0;
      gl.uniform1f(timeUniformLocation, elapsedSeconds);

      // Pass resolution
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

      // Pass active state
      gl.uniform1f(activeUniformLocation, active ? 1.0 : 0.0);

      // Set positions
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      // Set texCoords
      gl.enableVertexAttribArray(texCoordAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ pointerEvents: "none" }}
    />
  );
}
