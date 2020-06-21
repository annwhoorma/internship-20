// MY FUNCTION

function load3DObject(scene, loader, url) {
    const onLoad = (gltf) => {
        var model = gltf.scene.children[0];
        scene.add(model);
    };
    const onProgress = () => { };
    const onError = (errorMessage) => {
        console.log(errorMessage);
    };

    loader.load(url, gltf => onLoad(gltf), onProgress, onError);
}

var url = '';
load3DObject(scene, loader, url);



// FERRARI 

    // materials 
    var bodyMaterial = new THREE.MeshPhysicalMaterial( {
        color: 0x000333, metalness: 1.0, roughness: 0.5, clearcoat: 0.02, clearcoatRoughness: 0.01
    } );    

    var detailsMaterial = new THREE.MeshStandardMaterial( {
        color: 0xffffff, metalness: 1.0, roughness: 0.5
    } );

    var glassMaterial = new THREE.MeshPhysicalMaterial( {
        color: 0xffffff, metalness: 0, roughness: 0, transparency: 0.8, transparent: true
    } );

    var wheels = [];
    gltfloader.load(data, function (gltf) {

        var carModel = gltf.scene.children[0];

        carModel.getObjectByName( 'body' ).material = bodyMaterial;

        carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
        carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
        carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
        carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
        carModel.getObjectByName( 'trim' ).material = detailsMaterial;

        carModel.getObjectByName( 'glass' ).material = glassMaterial;

        wheels.push(
            carModel.getObjectByName( 'wheel_fl' ),
            carModel.getObjectByName( 'wheel_fr' ),
            carModel.getObjectByName( 'wheel_rl' ),
            carModel.getObjectByName( 'wheel_rr' )
        );

        scene.add( carModel );

    } );