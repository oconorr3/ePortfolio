
			if ( WEBGL.isWebGLAvailable() === false ) {
				document.body.appendChild( WEBGL.getWebGLErrorMessage() );
			}
			var container, stats;
			var camera, scene, renderer, light;
			var controls, water, sphere;
			init();
			animate();

			function init() {
				container = document.getElementById( 'three-scene-container' );
				//
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );
				//
				scene = new THREE.Scene();
				//
				camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
				camera.position.set( 0, 30, 100 );
				//

				light = new THREE.DirectionalLight( 0xffffff, 0.8 );
				scene.add( light );
				// Water
				var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
				water = new THREE.Water(
					waterGeometry,
					{
						textureWidth: 512,
						textureHeight: 512,
						waterNormals: new THREE.TextureLoader().load( 'three/textures/waternormals.jpg', function ( texture ) {
							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
						} ),
						alpha: 1.0,
						sunDirection: light.position.clone().normalize(),
						sunColor: 0xffffff,
						waterColor: 0x001e0f,
						distortionScale: 3.7,
						fog: scene.fog !== undefined
					}
				);
				water.rotation.x = - Math.PI / 2;
				scene.add( water );

				// Skybox
				var sky = new THREE.Sky();

				var uniforms = sky.material.uniforms;
				uniforms[ 'turbidity' ].value = 10;
				uniforms[ 'rayleigh' ].value = 2;
				uniforms[ 'luminance' ].value = 1;
				uniforms[ 'mieCoefficient' ].value = 0.005;
				uniforms[ 'mieDirectionalG' ].value = 0.8;

				var parameters = {
					distance: 400,
					inclination: 0.49,
					azimuth: 0.205
				};

				var cubeCamera = new THREE.CubeCamera( 0.1, 1, 512 );
				cubeCamera.renderTarget.texture.generateMipmaps = true;
				cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
				scene.background = cubeCamera.renderTarget;

        function updateSun() {
					var theta = Math.PI * ( parameters.inclination - 0.5 );
					var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
					light.position.x = parameters.distance * Math.cos( phi );
					light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
					light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
					sky.material.uniforms[ 'sunPosition' ].value = light.position.copy( light.position );
					water.material.uniforms[ 'sunDirection' ].value.copy( light.position ).normalize();
					cubeCamera.update( renderer, sky );
				}
				updateSun();

				window.addEventListener( 'resize', onWindowResize, false );
			}

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function animate() {
				requestAnimationFrame( animate );
				render();
			}

			function render() {
				var time = performance.now() * 0.001;

				water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
				renderer.render( scene, camera );
			}
