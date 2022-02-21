window.onload = () => {
    if (
        typeof window !== "undefined" &&
        window.document &&
        !/Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        )
    ) {
        fetch("static/fragment.glsl")
            .then((response) => response.text())
            .then((data) => {
                const vertexShader = `void main(){
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`;
                const fragmentShader = data;

                let width = window.innerWidth;
                let height = window.innerHeight;

                const scene = new THREE.Scene();
                const camera = new THREE.OrthographicCamera(
                    -width / 2,
                    width / 2,
                    height / 2,
                    -height / 2,
                    1,
                    500
                );

                const renderer = new THREE.WebGLRenderer({
                    antialias: false,
                    alpha: true,
                });
                renderer.setClearColor(0x00000, 0);
                renderer.setSize(width, height);

                window.addEventListener(
                    "resize",
                    () => {
                        width = window.innerWidth;
                        height = window.innerHeight;

                        camera.left = -width / 2;
                        camera.right = width / 2;
                        camera.top = -height / 2;
                        camera.bottom = height / 2;

                        mesh.material.uniforms.width.value = width;
                        mesh.material.uniforms.height.value = height;

                        mesh.material.uniforms.shapePos.value =
                            new THREE.Vector3(
                                window.innerWidth > mobileBreak ? width / 4 : 0,
                                0,
                                1100
                            );

                        renderer.setSize(width, height);
                    },
                    false
                );

                const geometry = new THREE.PlaneGeometry(width, height);
                const mobileBreak = 850;

                let material = new THREE.ShaderMaterial({
                    uniforms: {
                        planeDistance: { value: 800 }, //Distance from camera to the pixel rectangle
                        deMinThreshold: { value: 0.1 },
                        deMaxThreshold: { value: 1000 },
                        glowThreshold: { value: 5 },
                        bgColor: { value: new THREE.Vector4(0.1, 0.1, 0.1, 1) },
                        shapePos: {
                            value: new THREE.Vector3(
                                window.innerWidth > mobileBreak ? width / 4 : 0,
                                0,
                                1100
                            ),
                        },
                        shapeSize: { value: 250 },
                        lightRayPos: {
                            value: new THREE.Vector3(300, -300, 600),
                        },
                        lightRayDir: { value: new THREE.Vector3(1, -1, 1) },
                        lightRayColor: {
                            value: new THREE.Vector4(0.8, 0.8, 0.8, 1.1),
                        }, //r,g,b,strength
                        lightFalloffDistance: { value: 1300 },
                        shadowThreshold: { value: 25 },
                        shadowStength: { value: 0.8 }, //Lower is darker
                        mouseExists: { value: true },
                        mousePos: { value: new THREE.Vector3(800, 1800, 1100) },
                        mouseRatios: { value: new THREE.Vector2(0, 0) }, //(x/z, y/z) Calculated here so i'ts only calculated once per frame not, one per pixel for frame
                        scrollVal: { value: 0 },
                        width: { value: width },
                        height: { value: height },
                        time: { value: 0 },
                    },
                    vertexShader,
                    fragmentShader,
                });

                const mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);

                camera.position.z = 1;

                document
                    .getElementById("canvas-cont")
                    .appendChild(renderer.domElement);

                let mouse = [0, 0];
                document.addEventListener("mousemove", (e) => {
                    var rect = document
                        .querySelector("canvas")
                        .getBoundingClientRect();
                    mouse = [
                        e.clientX - rect.left - width / 2,
                        rect.top - e.clientY + height / 2,
                    ];
                });
                const sections = document.getElementsByClassName("rayt-sec");
                let currentSection = sections[0];

                let firstRender = true;

                const frameCap = 60;
                const invFrameCap = 1 / frameCap;
                let clock = new THREE.Clock();
                let dt = 0;

                const rotSpeed = 0.5;

                function render() {
                    dt = clock.getDelta();

                    setTimeout(
                        () => {
                            requestAnimationFrame(render);
                        },
                        dt < invFrameCap ? (invFrameCap - dt) * 1000 : 0
                    );

                    renderer.render(scene, camera);
                    mesh.material.uniforms.mousePos.value = new THREE.Vector3(
                        mouse[0],
                        mouse[1],
                        mesh.material.uniforms.mousePos.value.z
                    );
                    mesh.material.uniforms.mouseRatios.value =
                        new THREE.Vector2(
                            Math.atan2(
                                mouse[0],
                                mesh.material.uniforms.planeDistance.value
                            ),
                            Math.atan2(
                                mouse[1],
                                mesh.material.uniforms.planeDistance.value
                            )
                        );

                    let scroll = document.documentElement.scrollTop;
                    let scrolledPastCount = 0;
                    let i = 0;

                    while (i < sections.length) {
                        if (sections[i].getBoundingClientRect().top <= 0) {
                            //Sections that have been scrolled past
                            scrolledPastCount += 1;
                            currentSection = sections[i];
                        }
                        i++;
                    }
                    mesh.material.uniforms.scrollVal.value =
                        -currentSection.getBoundingClientRect().top /
                            currentSection.offsetHeight +
                        scrolledPastCount -
                        1;
                    mesh.material.uniforms.time.value += dt * rotSpeed;

                    if (firstRender) {
                        document
                            .getElementsByTagName("body")[0]
                            .classList.add("loaded");
                        document
                            .getElementById("loading-overlay")
                            .classList.add("loaded");
                        document
                            .getElementById("loading-overlay")
                            .addEventListener("transitionend", function () {
                                this.style.display = "none";
                            });
                        firstRender = false;
                    }
                }
                render();
            });
    } else {
        document.getElementsByTagName("body")[0].classList.add("loaded");
        document.getElementById("loading-overlay").classList.add("loaded");
        document
            .getElementById("loading-overlay")
            .addEventListener("transitionend", function () {
                this.style.display = "none";
            });
    }
};
