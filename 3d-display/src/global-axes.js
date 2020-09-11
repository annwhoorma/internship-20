import {
    BufferGeometry,
    LineBasicMaterial,
    Line,
    Vector3
} from 'three';

export class XYZ {
    constructor(origin, length, parentGroup, {lineWidth, xColor, yColor, zColor}) {
        function createLine(start, end, color, lineWidth) {
            const geometry = new BufferGeometry().setFromPoints([start, end]);
            const material = new LineBasicMaterial({color: color, linewidth: lineWidth});
            material.transparent = true;
            return new Line(geometry, material);
        }

        lineWidth = lineWidth || 1;
        xColor = xColor || 'red'; yColor = yColor || 'green'; zColor = zColor || 'blue';

        const xend = new Vector3(length+origin.x, origin.y, origin.z);
        const yend = new Vector3(origin.x, origin.y+length, origin.z);
        const zend = new Vector3(origin.x, origin.y, origin.z+length);

        parentGroup.add(createLine(origin, xend, xColor, lineWidth));
        parentGroup.add(createLine(origin, yend, yColor, lineWidth));
        parentGroup.add(createLine(origin, zend, zColor, lineWidth));
    }    
}