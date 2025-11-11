uniform vec3 uColor;
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main()
{
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

    // Gradient opacity from bottom to top
    // Since cone is positioned at [0, -2, 0] with height 8, 
    // vPosition.y ranges from -6 (bottom) to +2 (top)
    // Custom gradient: bottom=1.0, halfway=0.2, top=0.05
    float normalizedY = (vPosition.y + 6.0) / 8.0; // Normalize from 0 to 1
    
    float gradientOpacity;
    if (normalizedY <= 0.5) {
        // From bottom (0) to halfway (0.5): fade from 1.0 to 0.2
        gradientOpacity = mix(1.0, 0.2, normalizedY / 0.5);
    } else {
        // From halfway (0.5) to top (1.0): fade from 0.2 to 0.05
        gradientOpacity = mix(0.2, 0.05, (normalizedY - 0.5) / 0.5);
    }
    
    // Apply gradient to holographic effect
    float finalOpacity = holographic * gradientOpacity;

    // Final color
    gl_FragColor = vec4(uColor, finalOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
