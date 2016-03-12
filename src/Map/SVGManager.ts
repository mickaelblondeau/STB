function CreateSVG(id: string, style: string) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, 'id', id);
    svg.setAttributeNS(null, 'height', '4488');
    svg.setAttributeNS(null, 'width', '5900');
    svg.setAttributeNS(null, 'style', style);
    svg.setAttributeNS(null, 'class', 'stb-maps');

    document.getElementById('game').appendChild(svg);
}

function CreateGroup(color: string, name: string, id: string) {
    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttributeNS(null, 'fill', 'none');
    group.setAttributeNS(null, 'stroke', 'black');
    group.setAttributeNS(null, 'stroke-width', '6');
    group.setAttributeNS(null, 'id', id + '_1');
    document.getElementById(name).appendChild(group);

    group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttributeNS(null, 'fill', color);
    group.setAttributeNS(null, 'stroke', MapManager.EditColor(color, 50));
    group.setAttributeNS(null, 'stroke-width', '2');
    group.setAttributeNS(null, 'opacity', '0.4');
    group.setAttributeNS(null, 'id', id + '_2');
    document.getElementById(name).appendChild(group);
}

function AddToGroup(line: string , id: string , group: string) {
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', line);
    document.getElementById(group + '_1').appendChild(path);

    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', line);
    path.setAttributeNS(null, 'class', id);
    document.getElementById(group + '_2').appendChild(path);
}

function DrawCircle(x: string, y: string, r: string, stroke: string, width: string, fill: string) {
    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttributeNS(null, 'cx', x);
    circle.setAttributeNS(null, 'cy', y);
    circle.setAttributeNS(null, 'r', r);
    circle.setAttributeNS(null, 'stroke', stroke);
    circle.setAttributeNS(null, 'stroke-width', width);
    circle.setAttributeNS(null, 'fill', fill);
    document.getElementById("tradeSVG").appendChild(circle);
}

function DrawCube() {
    let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttributeNS(null, 'x', '0');
    rect.setAttributeNS(null, 'y', '0');
    rect.setAttributeNS(null, 'width', '100%');
    rect.setAttributeNS(null, 'height', '100%');
    rect.setAttributeNS(null, 'fill', 'purple');
    document.getElementById('tradeSVG').appendChild(rect);
}