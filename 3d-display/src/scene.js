import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Queue } from './Queue';
import { exportGLTF } from './exportGLTF';

var scene, camera, renderer, controls, grid;
var lights = new Array(8);
var modelDs = [];
var namesControl = new Map();

export function init(container_id) {
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

    let container = document.getElementById(container_id);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    grid = new THREE.GridHelper( 100, 40, 0x000000, 0x000000 );
    grid.material.opacity = 0.1;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
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
            return "(" + counter.toString() + ") " + name;
        }
    }

    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); //should be removed 
    dracoLoader.setDecoderConfig({ type: 'js' });
    
    const gltfloader = new GLTFLoader();
    gltfloader.setDRACOLoader(dracoLoader);

    name = setUniqueName();

    gltfloader.load(data, function (gltf) {
        let model = gltf.scene;
        let bfsResult = bfs(model);
        modelDs.push(new ModelDescription(model, name, model.scale.clone(), bfsResult));
        scene.add(model);
    });
    return name;
}

function bfs(model) {
    let queue = new Queue();
    let depth_counter = 0;
    let parent = new Node(model, null, depth_counter);

    queue.enqueue(parent);
    
    while (queue.isEmpty() == false) {
        let c = queue.dequeue();
        if (c.model.children.length == 0) {
            depth_counter -= 1;
        }
        else if (c.model.children.length > 0) {
            depth_counter += 1;
            c.model.children.forEach(child => {
                let node_child = new Node(child, c.model, depth_counter);
                c.children.push(node_child); // KEEP IT HERE PLEASE
                queue.enqueue(node_child);
            });
        }
    }
    return parent;
}


function getModelDByName(name) {
    let res;
    modelDs.forEach(m => {
        if (m.name == name) res = m;
    });
    return res;
}

export function updateListOfInternals(menu, modelName) {
    menu.innerHTML = "";
    let structure = getModelDByName(modelName).tree.getChildrenIDs();
    structure.forEach(record => {
        name = getModelDByName(modelName).model.getObjectById(record).name;
        let option = document.createElement('option');
        option.text = name;
        menu.add(option);
    });
}

// SETTERS FOR TRANSFORMATION

export function setTransformationProperty(modelsNames, value, callback) {
    for (let i = 0; i < modelsNames.length; i++) {
        let modelD = getModelDByName(modelsNames[i]);

        if (modelD != undefined) {
            callback(modelD, value);
        }
    }
}

export function setScale(modelName, value, {sx, sy, sz}) {
    let modelD = getModelDByName(modelName);
    if (modelD != undefined) {
        let initScale = modelD.initScale;
        value = parseFloat(value);
        let x = initScale.x * parseFloat(sx) * value / modelD.curScale;
        let y = initScale.y * parseFloat(sy) * value / modelD.curScale;
        let z = initScale.z * parseFloat(sz) * value / modelD.curScale;
        modelD.model.scale.set(x, y, z);
        modelD.curScale = value;
    }
}

export function getSize(modelName) {
    let modelD = getModelDByName(modelName);
    if (modelD != undefined) {
        return modelD.model.scale;
    }
}

export function setPosition(modelName, {x, y, z}) {
    let modelD = getModelDByName(modelName);
    if (modelD != undefined) {
        let initScale = modelD.initScale;
        modelD.model.position.set(initScale.x*parseFloat(x), initScale.y*parseFloat(y), initScale.z*parseFloat(z));
    }
}

// SETTERS FOR MATERIAL

export function setMaterialProperty(modelsNames, internalsNames, value, callback) {
    for (let i = 0; i < modelsNames.length; i++) {
        let modelD = getModelDByName(modelsNames[i]);

        if (modelD != undefined) {
            for (let j = 0; j < internalsNames[i].length; j++) {
                let curNode = modelD.tree.getNodeByName(internalsNames[i][j]);
                if (curNode != null && !(curNode.model instanceof THREE.Mesh)) {
                    let childrenIDs = curNode.getChildrenIDs();
                    childrenIDs.forEach(childID => {
                        if (modelD.model.getObjectById(childID) instanceof THREE.Mesh) {
                            callback(modelD, childID, value);
                        }
                    });
                }
                else if (curNode != null && curNode.model instanceof THREE.Mesh) {
                    callback(modelD, curNode.model.id, value);
                }
            }
        }
    }
}

export function setColor(modelD, meshID, color) {
    modelD.model.getObjectById(meshID).material.color.set(color);
}

export function setOpacity(modelD, meshID, value) {
    modelD.model.getObjectById(meshID).material.transparent = value > 0 ? true : false;
    modelD.model.getObjectById(meshID).material.opacity = value;   
}

export function setRoughness(modelD, meshID, value) {
    modelD.model.getObjectById(meshID).material.roughness = value;   
}

export function setMetalness(modelD, meshID, value) {
    modelD.model.getObjectById(meshID).material.metalness = value;   
}

export function setMetalnessMap(modelD, meshID, data) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.load(data, (texture) => {
        texture.image.isMap = true;
        modelD.model.getObjectById(meshID).material.needsUpdate = true;
        modelD.model.getObjectById(meshID).material.metalnessMap = texture;
    });
}

export function setRoughnessMap(modelD, meshID, data) {
    let textureLoader = new THREE.TextureLoader();
    textureLoader.load(data, (texture) => {
        texture.image.isMap = true;
        modelD.model.getObjectById(meshID).material.needsUpdate = true;
        modelD.model.getObjectById(meshID).material.roughnessMap = texture;
    });
}

// GETTERS FOR MATERIAL

export function getOpacityValue(modelName, meshName) {
    let modelD = getModelDByName(modelName);
    if (modelD != undefined) {
        let mesh = modelD.model.getObjectByName(meshName)
        if (mesh instanceof THREE.Mesh)
            return mesh.material.opacity.toFixed(2);
    }
    return null;
}

export function getRoughnessValue(modelName, meshName) {
    let modelD = getModelDByName(modelName);
    if (modelD != undefined) {
        let mesh = modelD.model.getObjectByName(meshName)
        if (mesh instanceof THREE.Mesh)
            return mesh.material.roughness.toFixed(2);
    }
    return null;
}

export function getMetalnessValue(modelName, meshName) {
    let modelD = getModelDByName(modelName);
    if (modelD != undefined) {
        let mesh = modelD.model.getObjectByName(meshName)
        if (mesh instanceof THREE.Mesh)
            return mesh.material.metalness.toFixed(2);
    }
    return null;
}

// GETTERS FOR TRNSFORMATION

export function getScaleValue(modelName){
    let modelD = getModelDByName(modelName);
    return (modelD != undefined) ? modelD.curScale : null;
}

export function getPosition(modelName){
    let modelD = getModelDByName(modelName);
    if (modelD != undefined) {
        let pos = modelD.model.position;
        let vector = new THREE.Vector3(pos.x.toFixed(2), pos.y.toFixed(2), pos.z.toFixed(2));
        return vector;
    }
    return null;
}

export function saveScene(fileName) {
    let newScene = new THREE.Group();
    modelDs.forEach(m => {
        newScene.children.push(m.model); // REMOVE. check Group.add()
        newScene.children[newScene.children.length-1].name = name.slice(0, m.name.length - 4);
    });
    exportGLTF(fileName, newScene.children);
}

export class ModelDescription {
    constructor(model, name, initScale, tree) {
        this.model = model;
        this.name = name; // !!! REMOVE

        this.initScale = initScale;
        this.curScale = 1;
        // this.size = this.initScale;

        this.initPosition = null;

        this.tree = tree;
        // this.createDictionar+zy(tree); // mapping: name (type) |-> id
    }
    
    createDictionary(tree) {
        this.structureDict = new Map();
        tree.forEach(node =>{
            this.structureDict.set(node.model.id, node.model.name); // ??????????????????????// make ID a key
        });
    }
}

class Node {
    constructor(model, parent, depth) {
        this.model = model; // contains .type, .name, .id   // !!! RENAME TO OBJ idk
        this.parent = parent; // REMOVE ???
        this.depth = depth;
        this.children = []; // remember that you need it to keep depth level of the tree
    }

    getNodeByName(name) {
        let queue = new Queue();
        queue.enqueue(this);
        let ret = null;
    
        while (queue.isEmpty() == false) {
            let node = queue.dequeue();
            if (node.model.name == name) {
                return node;
            }
            if (node.children.length > 0) {
                node.children.forEach(node_child => {
                    if (node_child.model.name == name) {
                        ret = node_child;
                        return;
                    }
                    queue.enqueue(node_child);
                });
                if (ret != null) 
                    return ret;
            }
        }
        return null;
    }

    getChildrenIDs() {
        let queue = new Queue();
        queue.enqueue(this);
        let list = [];
        list.push(this.model.id);
    
        while (queue.isEmpty() == false) {
            let node = queue.dequeue();
            if (node.children.length > 0) {
                node.children.forEach(node_child => {
                    list.push(node_child.model.id);
                    queue.enqueue(node_child);
                });
            }
        }
        return list;
    }
}