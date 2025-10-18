import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { Pane } from "tweakpane";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
);

camera.position.set(-0.17, 3.50, 3.00);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0.18, 3.18, -1.21);
controls.enabled = false;

const roomBounds = {
	minX: -2.5,
	maxX: 2.5,
	minY: 0.5,
	maxY: 5,
	minZ: -2.5,
	maxZ: 2.5
};

function clampCameraToRoom() {
	camera.position.x = Math.max(roomBounds.minX, Math.min(roomBounds.maxX, camera.position.x));
	camera.position.y = Math.max(roomBounds.minY, Math.min(roomBounds.maxY, camera.position.y));
	camera.position.z = Math.max(roomBounds.minZ, Math.min(roomBounds.maxZ, camera.position.z));
}

controls.addEventListener('change', clampCameraToRoom);

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const PI_2 = Math.PI / 2;
const mouseSensitivity = 0.002;

function lockPointer() {
	renderer.domElement.requestPointerLock();
}

function unlockPointer() {
	document.exitPointerLock();
}

renderer.domElement.addEventListener('click', () => {
	if (document.pointerLockElement !== renderer.domElement) {
		lockPointer();
	}
});

document.addEventListener('pointerlockchange', () => {
	if (document.pointerLockElement === renderer.domElement) {
		document.addEventListener('mousemove', onMouseMove);
	} else {
		document.removeEventListener('mousemove', onMouseMove);
	}
});

function onMouseMove(event) {
	const movementX = event.movementX || 0;
	const movementY = event.movementY || 0;

	euler.setFromQuaternion(camera.quaternion);

	euler.y -= movementX * mouseSensitivity;
	euler.x -= movementY * mouseSensitivity;

	euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

	camera.quaternion.setFromEuler(euler);
}

window.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		unlockPointer();
	}
});

const moveSpeed = 0.05
const keys = {
	w: false,
	a: false,
	s: false,
	d: false
};

window.addEventListener('keydown', (e) => {
	const key = e.key.toLowerCase();
	if (key in keys) {
		keys[key] = true;
	}
});

window.addEventListener('keyup', (e) => {
	const key = e.key.toLowerCase();
	if (key in keys) {
		keys[key] = false;
	}
});

function updateCameraMovement() {
	const direction = new THREE.Vector3();
	camera.getWorldDirection(direction);
	direction.y = 0;
	direction.normalize();

	const right = new THREE.Vector3();
	right.crossVectors(camera.up, direction).normalize();

	if (keys.w) {
		camera.position.addScaledVector(direction, moveSpeed);
	}
	if (keys.s) {
		camera.position.addScaledVector(direction, -moveSpeed);
	}
	if (keys.a) {
		camera.position.addScaledVector(right, moveSpeed);
	}
	if (keys.d) {
		camera.position.addScaledVector(right, -moveSpeed);
	}
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 5);
sunLight.position.set(20, 10, -10);
sunLight.target.position.set(-4, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -15;
sunLight.shadow.camera.right = 15;
sunLight.shadow.camera.top = 15;
sunLight.shadow.camera.bottom = -15;
sunLight.shadow.bias = -0.005;
sunLight.shadow.normalBias = 0;
sunLight.shadow.radius = 0;
scene.add(sunLight);
scene.add(sunLight.target);

const pane = new Pane({
	title: 'Light Controls',
	expanded: true,
});

const lightParams = {
	x: sunLight.position.x,
};

pane.addBinding(lightParams, 'x', {
	min: -20,
	max: 20,
	step: 0.1,
	label: 'X Position',
}).on('change', (ev) => {
	sunLight.position.x = ev.value;
});

const exrLoader = new EXRLoader();
exrLoader.load(
	"/hdris/alps_field_2k.exr",
	(texture) => {
		texture.mapping = THREE.EquirectangularReflectionMapping;
		scene.environment = texture;
		scene.background = texture;
	},
	undefined,
);

const gltfLoader = new GLTFLoader();
gltfLoader.load(
	"/models/room-mountain.glb",
	(gltf) => {
		const model = gltf.scene;

		model.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;

				if (child.material) {
					child.material.shadowSide = THREE.FrontSide;
					child.material.needsUpdate = true;
				}

				if (child.name === 'water_pool') {
					child.material = new THREE.MeshStandardMaterial({
						color: 0x0099dd,
						metalness: 0.5,
						roughness: 0.5,
						transparent: true,
						opacity: 0.4,
						envMapIntensity: 1.5,
					});
					child.receiveShadow = true;
					child.castShadow = false;

					child.position.y -= 0.05;

					child.userData.isWater = true;
					child.userData.originalPositions = child.geometry.attributes.position.array.slice();
				}
			}
		});

		scene.add(model);
	},
);

function animate() {
	requestAnimationFrame(animate);

	updateCameraMovement();
	clampCameraToRoom();

	const time = performance.now() * 0.001;
	scene.traverse((child) => {
		if (child.userData.isWater && child.geometry.attributes.position) {
			const positions = child.geometry.attributes.position.array;
			const originalPositions = child.userData.originalPositions;

			for (let i = 0; i < positions.length; i += 3) {
				const x = originalPositions[i];
				const z = originalPositions[i + 2];

				positions[i + 1] = originalPositions[i + 1] +
					Math.sin(x * 3 + time * 1.5) * 0.02 +
					Math.cos(z * 3 + time * 1.2) * 0.02 +
					Math.sin((x + z) * 2 + time * 0.8) * 0.015;
			}

			child.geometry.attributes.position.needsUpdate = true;
			child.geometry.computeVertexNormals();
		}
	});

	renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});