import { 
    init, 
    display_kind,
    change_color, 
    change_transparency,
    change_scale,
    getTrancparencyValue,
    exportGLTF
} from './scene.js'
const AColorPicker = require('a-color-picker');

init();

document.getElementById('file-submission').addEventListener('click', function() {
    var file = document.getElementById('file-selector').files[0];
    display_kind(URL.createObjectURL(file, { type: 'model/gltf-binary' }));
});

document.getElementById('selection-list').addEventListener('click', function() {
    document.getElementById('transparency-value').value = getTrancparencyValue(this.value);
})

AColorPicker.from('.picker').on('change', (picker, color) => {
    change_color(document.getElementById('selection-list').value, color);
});

document.getElementById('transparency-value').addEventListener('change', function() {
    change_transparency(document.getElementById('selection-list').value, this.value);
});

document.getElementById('scale-value').addEventListener('change', function() {
    change_scale(this.value);
});

document.getElementById('save-file').addEventListener('click', function() {
    exportGLTF('changed_kind');
});