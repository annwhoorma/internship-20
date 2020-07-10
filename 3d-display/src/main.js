import { 
    init, 
    display,
    highlightChosenObject,
    setMaterialProperty,
    setColor, 
    setOpacity,
    setRoughness,
    setMetalness,
    setScale,
    setPosition,
    setMetalnessMap,
    setRoughnessMap, 
    getOpacityValue,
    getScale,
    getPosition,
    getSize,
    getRoughnessValue,
    getMetalnessValue,
    updateListOfInternals,
    saveScene, 
    removeModel
} from './scene.js'

const AColorPicker = require('a-color-picker');

init(document.getElementById('scene-container'));


document.getElementById('file-submission').addEventListener('click', function() {
    var files = document.getElementById('file-selector').files;
    for (let i = 0; i < files.length; i++){
        name = display(files[i].name, URL.createObjectURL(files[i], { type: 'model/gltf-binary' }));
        let menu = document.getElementById('model-selection-list');
        let option = document.createElement('option');
        option.text = name;
        menu.add(option);
    }
});

document.getElementById('model-selection-list').addEventListener('click', function() {
    updateListOfInternals(document.getElementById('part-selection-list'), this.value);
    document.getElementById('scale-value').value = getScale(this.value);

    let vector = getPosition(this.value);
    document.getElementById('pos-x').value = vector.x;
    document.getElementById('pos-y').value = vector.y;
    document.getElementById('pos-z').value = vector.z;

    vector = getSize(this.value);
    document.getElementById('size-x').value = vector.x;
    document.getElementById('size-y').value = vector.y;
    document.getElementById('size-z').value = vector.z;
});

document.getElementById('part-selection-list').addEventListener('click', function() {
    highlightChosenObject(document.getElementById('model-selection-list').value, this.value);
    document.getElementById('opacity-value').value = getOpacityValue(document.getElementById('model-selection-list').value, this.value);
    document.getElementById('roughness-value').value = getRoughnessValue(document.getElementById('model-selection-list').value, this.value);
    document.getElementById('metalness-value').value = getMetalnessValue(document.getElementById('model-selection-list').value, this.value);
});

AColorPicker.from('.picker').on('change', (picker, color) => {
    setMaterialProperty([document.getElementById('model-selection-list').value], [[document.getElementById('part-selection-list').value]], color, setColor);
});

document.getElementById('opacity-value').addEventListener('input', function() {
    setMaterialProperty([document.getElementById('model-selection-list').value], [[document.getElementById('part-selection-list').value]], this.value, setOpacity);
});

document.getElementById('roughness-value').addEventListener('input', function() {
    setMaterialProperty([document.getElementById('model-selection-list').value], [[document.getElementById('part-selection-list').value]], this.value, setRoughness);
});

document.getElementById('metalness-value').addEventListener('input', function() {
    setMaterialProperty([document.getElementById('model-selection-list').value], [[document.getElementById('part-selection-list').value]], this.value, setMetalness);
});

document.getElementById('scale-value').addEventListener('input', function() {
    setScale(document.getElementById('model-selection-list').value, this.value,
    {sx: document.getElementById('size-x').value, sy: document.getElementById('size-y').value, sz: document.getElementById('size-z').value});

    let vector = getSize(document.getElementById('model-selection-list').value);
    document.getElementById('size-x').value = vector.x;
    document.getElementById('size-y').value = vector.y;
    document.getElementById('size-z').value = vector.z;
    
});

document.getElementById('save-file').addEventListener('click', function() {
    saveScene('scene');
    // removeModel(document.getElementById('model-selection-list').value);
});



// POSITION
document.getElementById('pos-x').addEventListener('input', function() {
    setPosition(document.getElementById('model-selection-list').value, 
                {x: this.value, y: document.getElementById('pos-y').value, z: document.getElementById('pos-z').value});
});
document.getElementById('pos-y').addEventListener('input', function() {
    setPosition(document.getElementById('model-selection-list').value, 
    {x: document.getElementById('pos-x').value, y: this.value, z: document.getElementById('pos-z').value});
});
document.getElementById('pos-z').addEventListener('input', function() {
    setPosition(document.getElementById('model-selection-list').value,
    {x: document.getElementById('pos-x').value, y: document.getElementById('pos-y').value, z: this.value});
});



// SIZE

document.getElementById('size-x').addEventListener('input', function() {
    setScale(document.getElementById('model-selection-list').value, document.getElementById('scale-value').value,
    {sx: this.value, sy: document.getElementById('size-y').value, sz: document.getElementById('size-z').value});
});
document.getElementById('size-y').addEventListener('input', function() {
    setScale(document.getElementById('model-selection-list').value, document.getElementById('scale-value').value,
    {sx: document.getElementById('size-x').value, sy: this.value, sz: document.getElementById('size-z').value});
});
document.getElementById('size-z').addEventListener('input', function() {
    setScale(document.getElementById('model-selection-list').value, document.getElementById('scale-value').value,
    {sx: document.getElementById('size-x').value, sy: document.getElementById('size-y').value, sz: this.value});
});



// METALNESS MAP

document.getElementById('file-submission-metalness').addEventListener('click', function() {
    var file = document.getElementById('file-selector').files[0];
    setMaterialProperty([document.getElementById('model-selection-list').value], 
        [[document.getElementById('part-selection-list').value]], 
        URL.createObjectURL(file, { type: 'image/jpeg' }), 
        setMetalnessMap);
});

// ROUGHNESS MAP

document.getElementById('file-submission-roughness').addEventListener('click', function() {
    var file = document.getElementById('file-selector').files[0];
    setMaterialProperty([document.getElementById('model-selection-list').value], 
        [[document.getElementById('part-selection-list').value]], 
        URL.createObjectURL(file, { type: 'image/jpeg' }), 
        setRoughnessMap);
});