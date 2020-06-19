import { init } from "./scene.js"

var fileInput = document.getElementById("file-selector");
var files = fileInput.files;
var accept = {
    binary : ["glb"]
};
var file;

for (var i = 0; i < files.length; i++) {
    file = files[i];
    if (file !== null) {
        if (accept.binary.indexOf(file.type) > -1) {
        data = file.getAsBinary();
        init(data);
        }
    }
}
