import {
    Box3,
    Mesh,
    Object3D,
    Quaternion,
    Vector3
} from 'three';
import { Queue } from './queue';

const DEFAULT_MODEL_VOLUME = 0.001;

export class ModelDescription {
    constructor(model, name) {
        this.model = model;
        this.name = name;
        this.model.name = name;
        this.changeStructure();
        this.fillInternals();
        this.fillGeometries();

        this.centralize();
    }

    fillInternals() {
        this.internals = [];
        const { model, internals } = this;
        model.traverse((child) => {
            internals.push(child);
        });
    }

    centralize() {
        this.box = new Box3().setFromObject(this.model);
        
        const {model} = this;
        model.traverse((child) => {
            const worldPosition = child.getWorldPosition(new Vector3());
            const box = new Box3().setFromObject(child);
            const boxCenter = box.getCenter(new Vector3());
            const offset = new Vector3().subVectors(worldPosition, boxCenter);

            const localRot = child.getWorldQuaternion(new Quaternion());
            localRot.inverse();
            const vec = offset.clone();
            vec.applyQuaternion(localRot);

            child.translateX(-vec.x);
            child.translateY(-vec.y);
            child.translateZ(-vec.z);

            child.traverse((anc) => {
                if (anc instanceof Mesh) {
                    let getWorldScale = (root, object) => {
                        const worldScale = new Vector3(1, 1, 1);
                        let tmp = object;
                        if (!tmp && !tmp.parent){
                            while (tmp.parent !== root) {
                                worldScale.x *= tmp.scale.x;
                                worldScale.y *= tmp.scale.y;
                                worldScale.z *= tmp.scale.z;
                                tmp = tmp.parent;
                            }
                        }
                        worldScale.x *= root.scale.x;
                        worldScale.y *= root.scale.y;
                        worldScale.z *= root.scale.z;

                        return worldScale;
                    }

                    const worldScale = getWorldScale(model, anc);
                    const localRot = anc.getWorldQuaternion(new Quaternion());
                    localRot.inverse();
                    const vec = new Vector3().copy(offset);
                    vec.applyQuaternion(localRot);
                    
                    anc.geometry.translate(vec.x/worldScale.x, vec.y/worldScale.y, vec.z/worldScale.z);
                }
            });
        });

        this.fixSize();
        const globalCenter = new Vector3(0, 0, 0);
        const position = model.position.clone();
        const offset = new Vector3().subVectors(globalCenter, position);
        model.translateX(offset.x);
        model.translateY(offset.y);
        model.translateZ(offset.z);
    }
    
    fixSize() {
        const { box, model } = this;
        const boxSize = box.getSize();
        const volume = boxSize.x * boxSize.y * boxSize.z;
        const scaleCoefficient =  Math.cbrt(DEFAULT_MODEL_VOLUME/volume);

        model.scale.multiplyScalar(scaleCoefficient);
    }

    changeStructure() {
        const model = this.model;
        const queue = new Queue();
        queue.enqueue({model: model, closestGroup: model});

        while (!queue.isEmpty()) {
            const pair = queue.dequeue();
            const closestGroup = pair.closestGroup;
            const { model } = pair;
            if (model.children.length > 0) {
                model.children.forEach(child => {
                    if (child instanceof Mesh) {
                        closestGroup.attach(child);
                        queue.enqueue({model: child, closestGroup: closestGroup});
                    }
                    else if (child instanceof Object3D) {
                        queue.enqueue({model: child, closestGroup: child});
                    }
                });
            }
        }
    }

    fillGeometries() {
        function isCounted(elem, array) {
            let res = false;
            for (const internal of array) {
                if (internal.geometry === elem) {
                    res = true;
                    break;
                }
            }
            return res;
        }

        this.geometries = new Map();

        const { geometries, internals } = this;

        internals.forEach(internal => {
            if (internal instanceof Mesh && internal.geometry) {
                if (isCounted(internal.geometry, internals)){
                    internal.geometry = internal.geometry.clone();
                }
            } 
        });
    }
}
