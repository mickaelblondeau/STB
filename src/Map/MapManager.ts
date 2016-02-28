///<reference path="MapData.ts"/>

class MapManager {
    static width: number = 5900;
    static currentWidth: number = 5900;
    static scale: number = 1;
    static fiefs: Array<any> = [];
    static colors: Array<any> = [];
    static factionId: number = 0;
    static tradeValues: Array<any> = [
        { name: '+160% / +170%', size: 32, color: 'grey' },
        { name: '-12% / +160%', size: 31, color: 'lime' },
        { name: '-31% / -12%', size: 11, color: 'purple' },
        { name: '-43% / -31%', size: 8.5, color: 'cyan' },
        { name: '-50% / -43%', size: 5, color: 'blue' },
        { name: '-50%', size: 1.5, color: 'white' },
    ];

    static Start() {
        MapManager.CheckLoaded();
    }

    static IsNA() {
        return document.getElementById('map').getAttribute('src').split('calradia_zoom')[0] == 'na_';
    }

    static GetMapData(): Array<any> {
        let datas: Array<Object>;

        if(MapManager.IsNA()) {
            datas = JSON.parse(naMAP);
        } else {
            datas = JSON.parse(euMAP);
        }

        return datas;
    }

    static CheckLoaded() {
        if(!document.querySelector('#game .icon') || !document.querySelector('#game .heroes.player')) {
            setTimeout(function(){ MapManager.CheckLoaded(); }, 200);
        } else {
            MapManager.LoadMap();
        }
    }

    static GetComercialFilters(): string {
        let res = '';
        MapManager.tradeValues.reverse();
        for(let trade of MapManager.tradeValues) {
            res += MapManager.GetLegendLine(trade.name, trade.color);
        }
        MapManager.tradeValues.reverse();
        return res;
    }

    static LoadMap() {
        MapManager.CreateSVG('factionSVG', 'position:absolute; z-index:1; display:none;');
        MapManager.CreateSVG('diploSVG', 'position:absolute; z-index:1; display:none;');
        MapManager.CreateSVG('tradeSVG', 'position:absolute; z-index:1; display:none; opacity: 0.5;');

        let legend = document.createElement('div');
        legend.setAttribute('id', 'legend');
        legend.setAttribute('style', 'position:fixed; z-index:10; background:white; top:134px; padding:5px; border:1px solid black;');
        legend.innerHTML = `
            <b>Diplomatic Filter</b><br>
            ${MapManager.GetLegendLine('You', 'rgb(0, 0, 255)')}
            ${MapManager.GetLegendLine('Allied', 'rgb(0, 255, 255)')}
            ${MapManager.GetLegendLine('Friendly', 'rgb(0, 255, 0)')}
            ${MapManager.GetLegendLine('Neutral', 'rgb(255, 255, 255)')}
            ${MapManager.GetLegendLine('Hostile', 'rgb(255, 127, 0)')}
            ${MapManager.GetLegendLine('At War', 'rgb(255, 0, 0)')}

            <b>Commercial Filter</b><br>
            ${MapManager.GetComercialFilters()}
            ${MapManager.GetLegendLine('+170 / +oo', 'purple')}
        `;
        document.getElementById('main').appendChild(legend);

        let menu = document.createElement('div');
        menu.setAttribute('id', 'mapOptions');
        menu.setAttribute('class', 'block');
        menu.innerHTML = `
            <div style='margin-left:10px; margin-right:10px;'>
                <h3>Strategus Tool Belt's Map</h3>
                <div style='clear:both'></div>
                <div class='options'>
                    <h4>Map filters</h4>
                    <input type="radio" name="mapType" value="factionSVG">Faction<br>
                    <input type="radio" name="mapType" value="diploSVG">Diplomatic<br>
                    <input type="radio" name="mapType" value="tradeSVG">Trade Zone<br>
                    <input type="radio" name="mapType" value="">None<br>

                    <h4>Default filter</h4>
                    <select id="defaultFilter">
                        <option value="factionSVG">Faction</option>
                        <option value="diploSVG">Diplomatic</option>
                        <option value="tradeSVG">Trade Zone</option>
                        <option value="">None</option>
                    </select>

                    <div id="diplomaticOptions" style="display:none">
                        <br><span style="font-weight:bold;">Change diplomacy</span><br>
                        <div id="inputs">
                            <input type="radio" name="diploType" value="A">Allied<br>
                            <input type="radio" name="diploType" value="F">Friendly<br>
                            <input type="radio" name="diploType" value="N">Neutral<br>
                            <input type="radio" name="diploType" value="H">Hostile<br>
                            <input type="radio" name="diploType" value="W">At War
                        </div>
                    </div>

                    <h4>Import - Export Diplomatic settings</h4>
                    <input type="text" id="diploExport" placeholder="Exported data will appear here" />
                    <button id="exportDiplo">Export</button><br>
                    <input type="text" id="diploImport" placeholder="Place data to import here" />
                    <button id="importDiplo">Import</button><br>
                    <button id="clearDiplo">Clear diplomatic information</button>
                </div>
            </div>
        `;
        document.getElementById('menu').appendChild(menu);

        MapManager.LoadFiefs();
        MapManager.GetPlayerFaction();
        MapManager.LoadDiplomacy();
        MapManager.GenerateMap();
        MapManager.CheckScale();
        MapManager.MapEvents();
    }

    static CreateSVG(id: string, style: string) {
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttributeNS(null, 'id', id);
        svg.setAttributeNS(null, 'height', '4488');
        svg.setAttributeNS(null, 'width', '5900');
        svg.setAttributeNS(null, 'style', style);
        svg.setAttributeNS(null, 'class', 'stb-maps');

        document.getElementById('game').appendChild(svg);
    }

    static GetLegendLine(name: string, color: string) {
        return `<div style="width:10px;height:10px;background:${color};border:1px solid black;display:inline-block;"></div> ${name}<br>`;
    }

    static LoadFiefs() {
        let icons = document.querySelectorAll('#game .icon');
        for(let i = 0; i < icons.length; ++i) {
            let icon = icons[i];
            let fief = {
                name: icon.firstElementChild.textContent,
                color: window.getComputedStyle(icon.firstElementChild).color,
                colorId: MapManager.RbgToId(window.getComputedStyle(icon.firstElementChild).color)
            };
            MapManager.fiefs.push(fief);

            var colorExist = false;
            for(let color of MapManager.colors) {
                if(color.color == fief.color) {
                    colorExist = true;
                }
            }

            if(!colorExist) {
                MapManager.colors.push({ id: MapManager.RbgToId(fief.color), color: fief.color });
            }
        }
    }

    static RbgToId(color: string): number {
        let colors = color.split('rgb(')[1].split(')')[0].split(', ');
        return parseInt(colors[0] + colors[1] + colors[2]);
    }

    static GetPlayerFaction() {
        MapManager.factionId = MapManager.RbgToId(window.getComputedStyle(document.querySelector('#game .heroes.player p')).color);
    }

    static LoadDiplomacy(): Array<any> {
        // load from local storage
        return [];
    }

    static GenerateMap() {
        for(let color of MapManager.colors) {
            MapManager.CreateGroup(color.color, 'factionSVG', color.id);
        }

        MapManager.CreateGroup('rgb(0, 0, 255)', 'diploSVG', 'Y');
        MapManager.CreateGroup('rgb(0, 255, 255)', 'diploSVG', 'A');
        MapManager.CreateGroup('rgb(0, 255, 0)', 'diploSVG', 'F');
        MapManager.CreateGroup('rgb(255, 255, 255)', 'diploSVG', 'N');
        MapManager.CreateGroup('rgb(255, 127, 0)', 'diploSVG', 'H');
        MapManager.CreateGroup('rgb(255, 0, 0)', 'diploSVG', 'W');

        let mapData = MapManager.GetMapData();
        for(let data of mapData) {
            var line = '';
            for(let i in data.list) {
                if(i == 0)
                    line += 'M' + data.list[i].x + ' ' + data.list[i].y;
                else
                    line += ' L' + data.list[i].x + ' ' + data.list[i].y;
            }

            line += ' Z';

            for(let fief of MapManager.fiefs) {
                if(fief.name == data.fief) {
                    MapManager.AddToGroup(line, fief.colorId, fief.colorId);
                    if(MapManager.factionId == fief.colorId) {
                        MapManager.AddToGroup(line, fief.colorId, 'Y');
                    } else {
                        var notfound = true;

                        let diplomacy = MapManager.LoadDiplomacy();
                        for(let relation of diplomacy) {
                            if(MapManager.RbgToId(fief.colorId) == relation.id) {
                                MapManager.AddToGroup(line, fief.colorId, relation.type);
                                notfound = false;
                                break;
                            }
                        }

                        if(notfound) {
                            MapManager.AddToGroup(line, fief.colorId, 'N');
                        }
                    }
                }
            }
        }
    }

    static EditColor(color: string, modifier: number): string {
        let colors: Array<string> = color.split('rgb(')[1].split(')')[0].split(', ');

        for(let i = 0; i < 3; ++i) {
            if(parseInt(colors[i]) + modifier <= 255)
                colors[i] = (parseInt(colors[i]) + modifier).toString();
            else
                colors[i] = '255';
        }

        return 'rgb(' + colors[0] + ', ' +colors[1] + ', ' + colors[2] + ')';
    }

    static CreateGroup(color: string, name: string, id: string) {
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

    static AddToGroup(line: string , id: string , group: string) {
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', line);
        document.getElementById(group + '_1').appendChild(path);

        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', line);
        path.setAttributeNS(null, 'class', id);
        document.getElementById(group + '_2').appendChild(path);
    }

    static CheckScale() {
        var newW = document.getElementById('map').clientWidth;
        if(MapManager.currentWidth != newW) {
            MapManager.currentWidth = newW;
            MapManager.scale = newW / MapManager.width;
            if(!isNaN(MapManager.scale)) {
                MapManager.SetScale('path');
                MapManager.SetScale('circle');
                MapManager.SetScale('rect');
                document.getElementById('mapdraw').style.zIndex = '0';
            }
        }
        setTimeout(function(){ MapManager.CheckScale(); }, 200);
    }

    static SetScale(element: string) {
        let elements = document.querySelectorAll(element);
        for(let i = 0; i < elements.length; ++i) {
            let elm = elements[i];
            elm.setAttribute('transform', 'scale(' + MapManager.scale + ')');
        }
    }

    static MapEvents() {
        let mapTypes = document.querySelectorAll('input[name="mapType"]');
        for(let i = 0; i < mapTypes.length; ++i) {
            mapTypes[i].addEventListener('click', function() {
                MapManager.ChangeMapFiler(this.value);
            });
        }

        document.getElementById('defaultFilter').addEventListener('change', function() {
            localStorage.setItem('stb3_default_filter', this.value);
        });

        MapManager.LoadDefaultFilter();

        let paths = document.querySelectorAll('path');
        for(let i = 0; i < paths.length; ++i) {
            paths[i].addEventListener('mouseenter', function() {
                this.setAttribute('opacity', '0.5');
            });
            paths[i].addEventListener('mouseout', function() {
                this.setAttribute('opacity', '1');
            });
            paths[i].addEventListener('dblclick', function() {
                // show diplomacy menu
                // save current selection
            });
        }

        // import diplo
        // export diplo
        // clear diplo

        paths = document.querySelectorAll('#game .icon');
        for(let i = 0; i < paths.length; ++i) {
            paths[i].addEventListener('click', function() {
                document.getElementById('tradeSVG').innerHTML = '';

                let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttributeNS(null, 'x', '0');
                rect.setAttributeNS(null, 'y', '0');
                rect.setAttributeNS(null, 'width', '100%');
                rect.setAttributeNS(null, 'height', '100%');
                rect.setAttributeNS(null, 'fill', 'purple');
                document.getElementById('tradeSVG').appendChild(rect);

                let style = window.getComputedStyle(this);

                for(let trade of MapManager.tradeValues) {
                    MapManager.AddTradeCircle(parseInt(style.left) / MapManager.scale, parseInt(style.top) / MapManager.scale, trade.size, trade.color);
                }

                MapManager.currentWidth = 0;
                MapManager.CheckScale();
            });
        }
    }

    static ChangeMapFiler(value: string) {
        let maps = document.querySelectorAll('.stb-maps');
        for(let j = 0; j < maps.length; ++j) {
            (<HTMLElement>maps[j]).style.display = 'none';
        }
        if(value != '') {
            document.getElementById(value).style.display = '';
        }

        let options = document.querySelectorAll('input[name="mapType"]');
        for(let i = 0; i < options.length; ++i) {
            let option = <HTMLInputElement>options[i];
            if(option.value == value) {
                option.checked = true;
            }
        }
    }

    static LoadDefaultFilter() {
        let defaultFilter = localStorage.getItem('stb3_default_filter') || '';
        MapManager.ChangeMapFiler(defaultFilter);

        let options = document.querySelectorAll('#defaultFilter option');
        for(let i = 0; i < options.length; ++i) {
            let option = <HTMLOptionElement>options[i];
            if(option.value == defaultFilter) {
                option.selected = true;
            }
        }
    }

    static AddTradeCircle(x: number, y: number, size: number, color: string) {
        let pixelPerKm = 40;
        MapManager.DrawCircle(x.toString(), y.toString(), (size * pixelPerKm).toString(), 'black', '2', color);
    }

    static DrawCircle(x: string, y: string, r: string, stroke: string, width: string, fill: string) {
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttributeNS(null, 'cx', x);
        circle.setAttributeNS(null, 'cy', y);
        circle.setAttributeNS(null, 'r', r);
        circle.setAttributeNS(null, 'stroke', stroke);
        circle.setAttributeNS(null, 'stroke-width', width);
        circle.setAttributeNS(null, 'fill', fill);
        document.getElementById("tradeSVG").appendChild(circle);
    }
}