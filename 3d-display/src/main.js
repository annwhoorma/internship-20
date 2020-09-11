import { 
    init, 
    display,
    onMouseClick,
    setColor,
    removeObject
} from './scene.js'

const AColorPicker = require('a-color-picker');

init(document.getElementById('scene-container'));

document.getElementById('file-submission').addEventListener('click', function() {
    var files = document.getElementById('file-selector').files;
    for (let i = 0; i < files.length; i++){
        name = display(files[i].name, URL.createObjectURL(files[i], { type: 'model/gltf-binary' }));
        let option = document.createElement('option');
        option.text = name;
    }
});

document.getElementById('scene-container').addEventListener('click', function() {
    onMouseClick(event);
})

AColorPicker.from('.picker').on('change', (picker, color) => {
    setColor(color);
});

document.addEventListener('keydown', event => {
    if (event.keyCode === 46) removeObject();
});