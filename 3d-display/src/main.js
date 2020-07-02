import { 
    init, 
    display,
    change_color, 
    change_opacity,
    change_roughness,
    change_metalness,
    change_scale,
    change_position,
    getOpacityValue,
    getScaleValue,
    getPosition,
    getRoughnessValue,
    getMetalnessValue,
    updateListOfInternals,
    save_scene
} from './scene.js'

const AColorPicker = require('a-color-picker');

init();

document.getElementById('file-submission').addEventListener('click', function() {
    var files = document.getElementById('file-selector').files;
    for (let i = 0; i < files.length; i++){
        display(files[i].name, URL.createObjectURL(files[i], { type: 'model/gltf-binary' }));
        let menu = document.getElementById('model-selection-list');
        let option = document.createElement('option');
        option.text = files[i].name;
        menu.add(option);
    }
});

document.getElementById('model-selection-list').addEventListener('click', function() {
    updateListOfInternals(document.getElementById('part-selection-list'), this.value);
    document.getElementById('scale-value').value = getScaleValue(document.getElementById('model-selection-list').value);

    let vector = getPosition(this.value);
    document.getElementById('pos-x').value = vector.x;
    document.getElementById('pos-y').value = vector.y;
    document.getElementById('pos-z').value = vector.z;
});

document.getElementById('part-selection-list').addEventListener('click', function() {
    document.getElementById('opacity-value').value = getOpacityValue(document.getElementById('model-selection-list').value, this.value);
    document.getElementById('roughness-value').value = getRoughnessValue(document.getElementById('model-selection-list').value, this.value);
    document.getElementById('metalness-value').value = getMetalnessValue(document.getElementById('model-selection-list').value, this.value);
});

AColorPicker.from('.picker').on('change', (picker, color) => {
    change_color(document.getElementById('model-selection-list').value, document.getElementById('part-selection-list').value, color);
});

document.getElementById('opacity-value').addEventListener('change', function() {
    change_opacity(document.getElementById('model-selection-list').value, document.getElementById('part-selection-list').value, this.value);
});

document.getElementById('roughness-value').addEventListener('change', function() {
    change_roughness(document.getElementById('model-selection-list').value, document.getElementById('part-selection-list').value, this.value);
});

document.getElementById('metalness-value').addEventListener('change', function() {
    change_metalness(document.getElementById('model-selection-list').value, document.getElementById('part-selection-list').value, this.value);
});

document.getElementById('scale-value').addEventListener('change', function() {
    change_scale(document.getElementById('model-selection-list').value, this.value);
});

document.getElementById('save-file').addEventListener('click', function() {
    save_scene('scene');
});

document.getElementById('pos-x').addEventListener('change', function() {
    change_position(document.getElementById('model-selection-list').value, 
                {x: this.value, y: document.getElementById('pos-y').value, z: document.getElementById('pos-z').value});
});

document.getElementById('pos-y').addEventListener('change', function() {
    change_position(document.getElementById('model-selection-list').value, 
    {x: document.getElementById('pos-x').value, y: this.value, z: document.getElementById('pos-z').value});
});

document.getElementById('pos-z').addEventListener('change', function() {
    change_position(document.getElementById('model-selection-list').value,
    {x: document.getElementById('pos-x').value, y: document.getElementById('pos-y').value, z: this.value});
});