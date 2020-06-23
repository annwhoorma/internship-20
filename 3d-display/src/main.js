import { init, display_kind , change_color, change_transparency} from './scene.js'
const AColorPicker = require('a-color-picker');

init();

document.getElementById('file-submission').addEventListener('click', function() {
    var file = document.getElementById('file-selector').files[0];
    display_kind(URL.createObjectURL(file, { type: 'model/gltf-binary' }));
});

AColorPicker.from('.picker').on('change', (picker, color) => {
    change_color(document.getElementById('selection-list').value, color);
});

document.getElementById('transparency-slider').addEventListener('change', function() {
    change_transparency(document.getElementById('selection-list').value, this.value);
});