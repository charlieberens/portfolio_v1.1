#define PI 3.14159

uniform float planeDistance;
uniform float deMinThreshold;
uniform float deMaxThreshold;
uniform float glowThreshold;
uniform float width;
uniform float height;

uniform float shapeSize;
uniform vec3 shapePos;

uniform vec4 bgColor;
uniform vec3 lightRayPos;
uniform vec3 lightRayDir;
uniform vec4 lightRayColor;
uniform float lightFalloffDistance;

uniform float shadowThreshold;
uniform float shadowStength;

uniform bool mouseExists;
uniform vec3 mousePos;
uniform vec2 mouseRatios;
uniform float scrollVal;
uniform float time;

float smin( float a, float b, float k )
{
    float h = max( k-abs(a-b), 0.0 )/k;
    return min( a, b ) - h*h*k*(1.0/4.0);
}

vec3 rotateVector(vec3 vec, vec3 rot){ //https://stackoverflow.com/questions/14607640/rotating-a-vector-in-3d-space
    vec3 outputVec = vec3(vec.x, vec.y * cos(rot.x) - vec.z * sin(rot.x), vec.y * sin(rot.x) + vec.z * cos(rot.x)); //Around z axis
    outputVec = vec3(outputVec.x * cos(rot.y) + outputVec.z * sin(rot.y), outputVec.y, -outputVec.x * sin(rot.y) + outputVec.z * cos(rot.y)); //Around y axis
    outputVec = vec3(outputVec.x * cos(rot.z) - outputVec.y * sin(rot.z), outputVec.x * sin(rot.z) + outputVec.y * cos(rot.z), outputVec.z); //Around z axis
    return outputVec;
}

float cylinderDist(vec3 vec, vec3 pos, float height, float rad, float cornerRad, vec3 rot){
    vec3 centerDist = rotateVector(vec - pos, rot);

    vec2 dist = abs(vec2(length(centerDist.xz), centerDist.y)) - vec2(rad * 2.0, height);
    return min(max(dist.x, dist.y), 0.0) + length(max(dist, 0.0)) - cornerRad;
}

float sphereDist(vec3 vec, vec3 pos, float rad){
    return distance(vec, pos) - rad;
}

float torusDist( vec3 vec, vec3 pos, float rad, float thickness, vec3 rot )
{
    vec3 centerDist = rotateVector(vec - pos, rot);
    vec2 q = vec2(length(centerDist.xz) - rad, centerDist.y);
    return length(q) - thickness;
}

float planeDist(vec3 vec){
    float height = -5000.0;
    int orientation = 1;
    return vec[orientation] - height;
}

float octohedronDist(vec3 vec, vec3 pos, float s, vec3 rot){
    vec3 centerDist = abs(rotateVector((vec - pos), rot));
    float m = centerDist.x+centerDist.y+centerDist.z-s;

    vec3 q;
    if( 3.0*centerDist.x < m ) q = centerDist.xyz;
    else if( 3.0*centerDist.y < m ) q = centerDist.yzx;
    else if( 3.0*centerDist.z < m ) q = centerDist.zxy;
    else return m*0.57735027;
        
    float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
    return length(vec3(q.x,q.y-s+k,q.z-k)); 

    return(centerDist.x+centerDist.y+centerDist.z-s) * .57735027;
}

float boxDist(vec3 vec, vec3 pos, vec3 dim, vec3 rot){
    vec3 centerDist = vec - pos;
    vec3 rotCenterDist = rotateVector(centerDist, rot);
    vec3 cornerDist = abs(rotCenterDist) - (dim);

    return length(vec3(max(cornerDist.x, 0.0), max(cornerDist.y, 0.0), max(cornerDist.z, 0.0))) - 0.0;
}

float frameDist(vec3 vec, vec3 pos, vec3 dim, float thickness, vec3 rot){
    vec3 centerDist = rotateVector(vec - pos, rot);
    vec3 cornerDist = abs(centerDist) - dim;
    vec3 q = abs(cornerDist+thickness) - thickness;

    return min(min(
        length(max(vec3(cornerDist.x,q.y,q.z),0.0))+min(max(cornerDist.x,max(q.y,q.z)),0.0),
        length(max(vec3(q.x,cornerDist.y,q.z),0.0))+min(max(q.x,max(cornerDist.y,q.z)),0.0)),
        length(max(vec3(q.x,q.y,cornerDist.z),0.0))+min(max(q.x,max(q.y,cornerDist.z)),0.0)
    );
}

float sceneDist(vec3 vec){
    float sphere1 = sphereDist(vec, vec3(mouseRatios.x * mousePos.z, mouseRatios.y * mousePos.z, mousePos.z), 75.0);

    float shape;
    float shape1;
    float shape2;
    if(scrollVal < .25){
        shape = octohedronDist(vec, shapePos, shapeSize, vec3(0,time,time / 2.0));
    }else if(scrollVal < .75){
        float fraction = (scrollVal - .25) * 2.0;
        float oppFraction = 1.0 - fraction;
        shape1 = octohedronDist(vec, shapePos, shapeSize * oppFraction, vec3(0,time,time / 2.0));
        shape2 = boxDist(vec, shapePos, .5 * vec3((shapeSize * fraction),(shapeSize * fraction),(shapeSize * fraction)), vec3(3,time * 1.5,time / 2.0));
        shape = smin(shape1, shape2, 200.0);
    }else if(scrollVal < 1.25){
        shape = boxDist(vec, shapePos, .5 * vec3(shapeSize, shapeSize, shapeSize), vec3(3,time * 1.5,time / 2.0));
    }else if(scrollVal < 1.75){
        float fraction = (scrollVal - 1.25) * 2.0;
        float oppFraction = 1.0 - fraction;
        shape1 = boxDist(vec, shapePos, .5 * oppFraction * vec3(shapeSize, shapeSize, shapeSize), vec3(3,time * 1.5,time / 2.0));
        shape2 = torusDist(vec, shapePos, shapeSize * fraction * .5, 75.0 * fraction, vec3(time * .75,0,time * 2.0));
        shape = smin(shape1, shape2, 200.0);
    }else if(scrollVal < 2.25){
        shape = torusDist(vec, shapePos, shapeSize * .5, 75.0, vec3(time * .75,0,time * 2.0));
    }else if(scrollVal < 2.75){
        float fraction = (scrollVal - 2.25) * 2.0;
        float oppFraction = 1.0 - fraction;
        shape1 = torusDist(vec, shapePos, shapeSize * oppFraction * .5, 75.0 * oppFraction, vec3(time * .75,0,time * 2.0));
        shape2 = frameDist(vec, shapePos, .5 * vec3((shapeSize * fraction),(shapeSize * fraction),(shapeSize * fraction)), fraction * 20.0, vec3(time * 2.0,15,time));
        shape = smin(shape1, shape2, 200.0);
    }else{
        shape = frameDist(vec, shapePos, .5 * vec3(shapeSize, shapeSize, shapeSize), 20.0, vec3(time * 2.0,15,time));
    }
    if(mouseExists){
        float sphere1 = sphereDist(vec, vec3(mouseRatios.x * mousePos.z, mouseRatios.y * mousePos.z, mousePos.z), 75.0);
        return smin(shape, sphere1, 200.0);
    }else{
        return(shape);
    }
}

vec3 calcNormal(vec3 vec){
    float dp = .0001;

    vec3 norm = vec3( //Approximates the gradient by moving by dp in each direction  
        sceneDist(vec + vec3(dp, 0, 0)) - sceneDist(vec - vec3(dp,0,0)),
        sceneDist(vec + vec3(0, dp, 0)) - sceneDist(vec - vec3(0,dp,0)),
        sceneDist(vec + vec3(0, 0, dp)) - sceneDist(vec - vec3(0,0,dp))
    );
    return normalize(norm);
}

void main(){
    vec2 coords = vec2((gl_FragCoord.x - .5) - width / 2.0, (gl_FragCoord.y - .5) - height / 2.0); //Converts to a sane coordinate system
    vec3 ray = vec3(coords, planeDistance);
    vec3 unitRay = normalize(ray);

    float de = sceneDist(ray);
    int count = 0;
    float minDist = de;
    while(de > deMinThreshold && de < deMaxThreshold && count < 500){
        ray += unitRay * de;
        de = sceneDist(ray);
        if(de < minDist){
            minDist = de;
        }
        count += 1;
    }

    if(de <= deMinThreshold){
        // March towards lightsource
        vec3 unitCameraRay = calcNormal(ray);
        vec3 unitLightRayDir = normalize(lightRayDir);
        vec3 unitDirToLight = normalize(lightRayPos - ray);
        vec3 cameraRay = ray + unitDirToLight * 10.0;
        float light_dist = distance(cameraRay, lightRayPos);
        int lightCount = 0;
        float cam_de = sceneDist(cameraRay);
        float min_cam_de = shadowThreshold + .1;

        while((cam_de > deMinThreshold || lightCount < 5) && cam_de < deMaxThreshold && light_dist > .1 && lightCount < 150){
            cameraRay += unitDirToLight * min(max(cam_de, 0.0), light_dist);
            light_dist = distance(cameraRay, lightRayPos);
            cam_de = sceneDist(cameraRay);

            if(lightCount == 5 || (lightCount > 5 && cam_de < min_cam_de && cam_de > 0.0)){
                min_cam_de = cam_de;
            }

            lightCount += 1;
        }
        float lightRayDiff = acos(dot(unitCameraRay, -unitDirToLight)) / (PI);
        float lightRayStrength = lightRayColor[3] / max(lightRayColor.x, max(lightRayColor.y, lightRayColor.z));
        gl_FragColor = min(lightFalloffDistance / distance(ray, lightRayPos), 1.0) * vec4(max(abs(ray.x) / 150.0, .7) * lightRayDiff * lightRayColor.x * lightRayStrength, max(abs(ray.y) / 200.0, .7) * lightRayDiff * lightRayColor.y * lightRayStrength, max(abs(ray.z) / 1000.0, .7) * lightRayDiff * lightRayColor.z * lightRayStrength, 1.0);
        if(dot(unitCameraRay, -unitDirToLight) <= 0.0){
        }
        if(cam_de <= deMinThreshold){
            gl_FragColor = shadowStength * gl_FragColor;
        }else{
            if(min_cam_de < shadowThreshold){
                float light_power = min_cam_de/shadowThreshold;
                gl_FragColor = (1.0 - (((1.0 - shadowStength )* (1.0 - light_power)))) * gl_FragColor;
            }
        }
    }else if(minDist < glowThreshold){
        gl_FragColor = vec4(1.0 - minDist / glowThreshold, 1.0 - minDist / glowThreshold, 1.0 - minDist / glowThreshold, 1.0);
    }else{
        discard;
    }
}