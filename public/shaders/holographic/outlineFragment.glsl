uniform vec3 uColor;
uniform float uTime;
uniform sampler2D uTexture;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main()
{
    // Sample the texture
    vec4 textureColor = texture2D(uTexture, vUv);
    
    // Create edge detection using Sobel operator
    vec2 texelSize = vec2(1.0 / 2048.0, 1.0 / 2048.0); // Even smaller texel size for very thin lines
    
    // Sample neighboring pixels
    float tl = texture2D(uTexture, vUv + vec2(-texelSize.x, -texelSize.y)).r;
    float tm = texture2D(uTexture, vUv + vec2(0.0, -texelSize.y)).r;
    float tr = texture2D(uTexture, vUv + vec2(texelSize.x, -texelSize.y)).r;
    float ml = texture2D(uTexture, vUv + vec2(-texelSize.x, 0.0)).r;
    float mm = texture2D(uTexture, vUv + vec2(0.0, 0.0)).r;
    float mr = texture2D(uTexture, vUv + vec2(texelSize.x, 0.0)).r;
    float bl = texture2D(uTexture, vUv + vec2(-texelSize.x, texelSize.y)).r;
    float bm = texture2D(uTexture, vUv + vec2(0.0, texelSize.y)).r;
    float br = texture2D(uTexture, vUv + vec2(texelSize.x, texelSize.y)).r;
    
    // Sobel edge detection
    float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
    float gy = (bl + 2.0 * bm + br) - (tl + 2.0 * tm + tr);
    float edge = sqrt(gx * gx + gy * gy);
    
    // Normal
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing)
        normal *= - 1.0;

    // Stripes
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Falloff
    float falloff = smoothstep(0.8, 0.2, fresnel);

    // Holographic
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;

    // Fill in the letters/text areas instead of just outlining
    float textFill = 1.0 - textureColor.r; // Invert to get text areas
    textFill = smoothstep(0.3, 0.7, textFill); // Threshold for text areas
    
    // Combine with edge detection for better definition
    float outline = edge * 0.3;
    outline = smoothstep(0.02, 0.08, outline);
    
    // Final color - filled text with holographic effect
    vec3 finalColor = uColor * (textFill + outline + holographic * 0.3);
    float alpha = textFill + outline + holographic * 0.5;

    gl_FragColor = vec4(finalColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
