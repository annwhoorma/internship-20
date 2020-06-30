import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'

export function exportGLTF(name, scene) {
    var gltfExporter = new GLTFExporter();

    gltfExporter.parse(scene, function ( result ) {
        if ( result instanceof ArrayBuffer ) {
            saveArrayBuffer(result, name+'.glb');
        } else {
            var output = JSON.stringify(result, null, 2);
            saveString(output, name+'.glb');
        }
    }, {binary: true} );
}

var link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link); // Firefox workaround, see #6594

function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function saveString(text, filename) {
    save(new Blob([text], {type: 'text/plain'}), filename);
}

function saveArrayBuffer(buffer,filename) {
    save(new Blob([buffer], {type: 'application/octet-stream'}), filename);
}