import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { XYZ } from './global-axes';
import { ModelDescription } from './model-description';

var scene, camera, renderer, grid, helpingBox, transformControls, orbitControls, raycaster, mouseVector, XYZgroup;
var pickedObject, pickedModelD, mouseClickLock;
var lights = new Array(8);
var modelDs = [];
var namesControl = new Map();

const MOUSE_VECTOR_INITIAL_POSITION = [-Infinity, -Infinity];

export function init(container) {
    // create the gray scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('gray');

    // create the camera
    camera = new THREE.PerspectiveCamera( 60, 2, 0.1, 1000 );
    camera.position.set(0.4, 0.2, 0.2);
    
    for (let i = 0; i < 8; i++){
        lights[i] = new THREE.DirectionalLight(0xffffff, 0.9);
    }
    lights[0].position.set(100, 100, 100);
    lights[1].position.set(-100, 100, -100);
    lights[2].position.set(-100, -100, -100);
    lights[3].position.set(100, -100, 100);
    lights[4].position.set(100, 0, 0);
    lights[5].position.set(-100, 0, 0);
    lights[6].position.set(0, 0, 100);
    lights[7].position.set(0, 0, -100);
    for (let i = 0; i < 8; i++){
        scene.add(lights[i]);
    }

    renderer = new THREE.WebGLRenderer();
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    orbitControls = new OrbitControls(camera, renderer.domElement);

    mouseClickLock = false;
    let orbitControlsStartTime, orbitControlsEndTime;

    let orbitControlsStarted = (event) => {
        mouseClickLock = true;
        orbitControlsStartTime = new Date();
    }
    
    let orbitControlsEnded = (event) => {
        orbitControlsEndTime = new Date();
        if (orbitControlsEndTime - orbitControlsStartTime < 300) {
            mouseClickLock = false;
            return;
        }
        let lock = mouseClickLock;
        setTimeout(lock = false, 500);
    }

    orbitControls.addEventListener('start', orbitControlsStarted);
    orbitControls.addEventListener('end', orbitControlsEnded);

    grid = new THREE.GridHelper(5, 50, 0x111111, 0x999999);
    grid.material.opacity = 0.3;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);

    XYZgroup = new THREE.Group();
    new XYZ(scene.position, 0.1, XYZgroup, {
        lineWidth: 0.3,
        xColor: 'red',
        yColor: 'green',
        zColor: 'blue'
    });
    scene.add(XYZgroup);

    transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls);
    transformControls.visible = false;

    let transformControlsDragging = (event) => {
        orbitControls.enabled = !event.value;
    }

    transformControls.addEventListener('dragging-changed', transformControlsDragging);

    raycaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector2(MOUSE_VECTOR_INITIAL_POSITION[0], MOUSE_VECTOR_INITIAL_POSITION[1]);
    helpingBox = undefined;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if (helpingBox) {
        helpingBox.update();
    }
    if (!transformControls && pickedObject) {
        transformControls.attach(pickedObject);
    }
}

export function display(name, data) {
    function setUniqueName() {
        if (namesControl.get(name) == undefined) {
            namesControl.set(name, 1);
            return name;
        }
        else {
            let counter = namesControl.get(name)+1;
            namesControl.set(name, counter);
            return `(${counter-1}) ${name}`
        }
    }

    const dracoLoader = new DRACOLoader();
    const gltfloader = new GLTFLoader();
    gltfloader.setDRACOLoader(dracoLoader);

    name = setUniqueName();

    gltfloader.load(data, function (gltf) {
        let model = gltf.scene;
        const modelD = new ModelDescription(model, name);
        modelDs.push(modelD);
        scene.add(model);
        setPickedObject(modelD, model, {focusCamera:true});
    });
}

export function removeObject() {
    if (!pickedObject) return;
    const parent = pickedObject.parent;
    if (!parent) return;
    pickedObject.material?.dispose();
    pickedObject.geometry?.dispose();
    pickedObject.texture?.dispose();
    parent.remove(pickedObject);
    unsetPickedObject();
}

function getModelDByInternal(internal) {
    for (let modelD of modelDs) {
        const structure = modelD.internals;
        for (let str of structure) {
            if (str.id === internal.id) {
                return modelD;
            }
        }
    }
}

export function setColor(color) {
    if (!pickedObject) return;
    pickedObject.material.color.set(color);
}

function removeHelpingBox() {
    if (!helpingBox)
        return;
    helpingBox.material.dispose();
    helpingBox.geometry.dispose();
    scene.remove(helpingBox);
}

function highlightObject({focusCamera = false}) {
    if (helpingBox) {
        removeHelpingBox();
    }
    helpingBox = new THREE.BoxHelper(pickedObject, 0xffffff);
    helpingBox.visible = true;
    scene.add(helpingBox);
    
    transformControls.attach(pickedObject);
    transformControls.visible = true;
    // if (focusCamera) focusCameraOn(object);
}

function unhighlightObject() {
    if (
        helpingBox) {
        helpingBox.visible = false;
        removeHelpingBox();
    }
    transformControls.detach();
    transformControls.visible = false;
}

function setPickedObject(modelD, pickedNew, {focusCamera=false}) {
    if (pickedObject !== pickedNew) {
        pickedObject = pickedNew;
        pickedModelD = modelD;
    }
    highlightObject({focusCamera: focusCamera});
}

function unsetPickedObject() {
    unhighlightObject();
    pickedObject = undefined;
    pickedModelD = undefined;
}

function managePickedObjectOnMouseClick(newPickedObject) {
    const modelD = getModelDByInternal(newPickedObject);
    if (!modelD) return;
    else if (pickedObject === newPickedObject) {
        unsetPickedObject();
    }
    else if (pickedObject !== newPickedObject) {
        setPickedObject(modelD, newPickedObject, {focusCamera: true});
    }  
}

export function onMouseClick(event) {
    if (mouseClickLock) return;
    function findFirstMesh(intersects) {
        let res;
        intersects.forEach(inter => {
            if (inter.object instanceof THREE.Mesh && getModelDByInternal(inter.object)){
                res = inter.object;
            }
        });
        return res;
    }

    function getMousePosition(event, renderer, mouseVector) {
        let rendererSize = renderer.getSize(new THREE.Vector2());
        let width = rendererSize.x;
        let height = rendererSize.y;
        mouseVector.x = (event.offsetX / width) * 2 - 1;
        mouseVector.y = - (event.offsetY / height) * 2 + 1;
    }

    getMousePosition(event, renderer, mouseVector);
    raycaster.setFromCamera(mouseVector, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const firstHit = findFirstMesh(intersects);
    console.log(firstHit);
    
    if (firstHit instanceof THREE.Mesh) {
        managePickedObjectOnMouseClick(firstHit);
    }
    else {
        unsetPickedObject();
    }
}