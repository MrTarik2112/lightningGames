class ShaderManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.enabled = {
            bloom: true,
            chromatic: true,
            vignette: true,
            scanline: false,
            crt: false
        };
        this.intensity = {
            bloom: 0.3,
            chromatic: 0.002,
            vignette: 0.4,
            scanline: 0.1
        };
        
        this.initWebGL();
    }

    initWebGL() {
        try {
            this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
            if (!this.gl) {
                console.warn('WebGL not supported, falling back to canvas effects');
                return;
            }
            
            this.setupShaders();
            this.setupFramebuffers();
        } catch (e) {
            console.warn('WebGL initialization failed:', e);
        }
    }

    setupShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;
            uniform float u_time;
            uniform vec2 u_resolution;
            
            uniform bool u_bloomEnabled;
            uniform float u_bloomIntensity;
            uniform bool u_chromaticEnabled;
            uniform float u_chromaticIntensity;
            uniform bool u_vignetteEnabled;
            uniform float u_vignetteIntensity;
            uniform bool u_scanlineEnabled;
            uniform float u_scanlineIntensity;
            uniform bool u_crtEnabled;
            
            vec3 bloom(sampler2D tex, vec2 uv, float intensity) {
                vec3 color = vec3(0.0);
                float total = 0.0;
                for (float x = -4.0; x <= 4.0; x += 1.0) {
                    for (float y = -4.0; y <= 4.0; y += 1.0) {
                        float dist = sqrt(x*x + y*y);
                        float weight = 1.0 / (1.0 + dist * dist);
                        vec2 offset = vec2(x, y) / u_resolution * intensity * 3.0;
                        color += texture2D(tex, uv + offset).rgb * weight;
                        total += weight;
                    }
                }
                return color / total;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                vec3 color = texture2D(u_texture, uv).rgb;
                
                if (u_chromaticEnabled) {
                    float offset = u_chromaticIntensity;
                    color.r = texture2D(u_texture, uv + vec2(offset, 0.0)).r;
                    color.b = texture2D(u_texture, uv - vec2(offset, 0.0)).b;
                }
                
                if (u_bloomEnabled) {
                    vec3 bloomColor = bloom(u_texture, uv, u_bloomIntensity * 30.0);
                    color += bloomColor * u_bloomIntensity;
                }
                
                if (u_vignetteEnabled) {
                    vec2 center = uv - 0.5;
                    float dist = length(center);
                    float vignette = 1.0 - smoothstep(0.3, 0.9, dist);
                    color *= mix(1.0, vignette, u_vignetteIntensity);
                }
                
                if (u_scanlineEnabled) {
                    float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.5 + 0.5;
                    color *= 1.0 - (scanline * u_scanlineIntensity);
                }
                
                if (u_crtEnabled) {
                    vec2 crtUV = uv * 2.0 - 1.0;
                    float dist = length(crtUV);
                    float barrel = 1.0 + dist * dist * 0.1;
                    float scanline = sin(uv.y * u_resolution.y * 2.0) * 0.03;
                    color += scanline;
                }
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const gl = this.gl;
        
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
            return;
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
            return;
        }

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(this.program));
            return;
        }
        
        this.locations = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            texCoord: gl.getAttribLocation(this.program, 'a_texCoord'),
            texture: gl.getUniformLocation(this.program, 'u_texture'),
            time: gl.getUniformLocation(this.program, 'u_time'),
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            bloomEnabled: gl.getUniformLocation(this.program, 'u_bloomEnabled'),
            bloomIntensity: gl.getUniformLocation(this.program, 'u_bloomIntensity'),
            chromaticEnabled: gl.getUniformLocation(this.program, 'u_chromaticEnabled'),
            chromaticIntensity: gl.getUniformLocation(this.program, 'u_chromaticIntensity'),
            vignetteEnabled: gl.getUniformLocation(this.program, 'u_vignetteEnabled'),
            vignetteIntensity: gl.getUniformLocation(this.program, 'u_vignetteIntensity'),
            scanlineEnabled: gl.getUniformLocation(this.program, 'u_scanlineEnabled'),
            scanlineIntensity: gl.getUniformLocation(this.program, 'u_scanlineIntensity'),
            crtEnabled: gl.getUniformLocation(this.program, 'u_crtEnabled')
        };

        const vertices = new Float32Array([
            -1, -1, 0, 1,
            1, -1, 1, 1,
            -1, 1, 0, 0,
            1, 1, 1, 0
        ]);
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    setupFramebuffers() {
        if (!this.gl) return;
        
        this.framebuffer = this.gl.createFramebuffer();
        this.texture = this.gl.createTexture();
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.canvas.width, this.canvas.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    setEnabled(effect, enabled) {
        this.enabled[effect] = enabled;
    }

    setIntensity(effect, intensity) {
        this.intensity[effect] = intensity;
    }

    render(texture, time) {
        if (!this.gl || !this.program) return false;
        
        const gl = this.gl;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(this.program);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.locations.position);
        gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(this.locations.texCoord);
        gl.vertexAttribPointer(this.locations.texCoord, 2, gl.FLOAT, false, 16, 8);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.locations.texture, 0);
        
        gl.uniform1f(this.locations.time, time);
        gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
        
        gl.uniform1i(this.locations.bloomEnabled, this.enabled.bloom ? 1 : 0);
        gl.uniform1f(this.locations.bloomIntensity, this.intensity.bloom);
        gl.uniform1i(this.locations.chromaticEnabled, this.enabled.chromatic ? 1 : 0);
        gl.uniform1f(this.locations.chromaticIntensity, this.intensity.chromatic);
        gl.uniform1i(this.locations.vignetteEnabled, this.enabled.vignette ? 1 : 0);
        gl.uniform1f(this.locations.vignetteIntensity, this.intensity.vignette);
        gl.uniform1i(this.locations.scanlineEnabled, this.enabled.scanline ? 1 : 0);
        gl.uniform1f(this.locations.scanlineIntensity, this.intensity.scanline);
        gl.uniform1i(this.locations.crtEnabled, this.enabled.crt ? 1 : 0);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        return true;
    }

    resize(width, height) {
        if (!this.gl) return;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    }
}

class CanvasEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.enabled = {
            glow: true,
            motionBlur: false,
            chromatic: false
        };
        
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = canvas.width;
        this.offscreenCanvas.height = canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    applyGlow(ctx, x, y, radius, color, intensity) {
        if (!this.enabled.glow) return;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.globalAlpha = intensity;
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        ctx.globalAlpha = 1;
    }

    applyNeonText(ctx, text, x, y, options = {}) {
        const {
            font = 'bold 24px Arial',
            color = '#00d4ff',
            glowColor = 'rgba(0, 212, 255, 0.5)',
            glowRadius = 20,
            glowIntensity = 0.8
        } = options;
        
        ctx.save();
        ctx.font = font;
        ctx.textAlign = options.align || 'center';
        ctx.textBaseline = options.baseline || 'middle';
        
        if (this.enabled.glow) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = glowRadius;
        }
        
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        
        ctx.shadowBlur = glowRadius * 2;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        
        ctx.restore();
    }

    applyNeonRect(ctx, x, y, width, height, options = {}) {
        const {
            strokeColor = '#00d4ff',
            lineWidth = 2,
            glowColor = 'rgba(0, 212, 255, 0.5)',
            glowRadius = 15,
            cornerRadius = 0
        } = options;
        
        ctx.save();
        
        if (this.enabled.glow) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = glowRadius;
        }
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        
        if (cornerRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, cornerRadius);
            ctx.stroke();
        } else {
            ctx.strokeRect(x, y, width, height);
        }
        
        ctx.shadowBlur = glowRadius * 2;
        ctx.stroke();
        
        ctx.restore();
    }

    captureFrame() {
        this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        this.offscreenCtx.drawImage(this.canvas, 0, 0);
        return this.offscreenCanvas;
    }

    applyMotionBlur(blurAmount = 0.3) {
        if (!this.enabled.motionBlur) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = blurAmount;
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        this.ctx.restore();
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
    }
}

window.ShaderManager = ShaderManager;
window.CanvasEffects = CanvasEffects;
