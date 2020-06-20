import { init } from "./scene.js"


document.getElementById("file-submission").addEventListener("click", function() {
    console.log('hey');
    var file = document.getElementById("file-selector").files[0];
    init(URL.createObjectURL(file, { type: 'model/gltf-binary' }));
});

