import { init, display_kind , change_color} from "./scene.js"

init();

document.getElementById("file-submission").addEventListener("click", function() {
    var file = document.getElementById("file-selector").files[0];
    display_kind(URL.createObjectURL(file, { type: 'model/gltf-binary' }));
});

var color_input = document.getElementById('any-color');
color_input.addEventListener('input', function () {
    change_color(document.getElementById("selection-list").value, this.value);
});
