///<reference path="MapData.ts"/>
///<reference path="SVGManager.ts"/>

class MapManager {
    static width: number = 5900;
    static currentWidth: number = 5900;
    static scale: number = 1;
    static pixelPerKm: number = 40;
    static fiefs: Array<any> = [];
    static colors: Array<any> = [];
    static diplomacies: Array<any> = [];
    static factionId: number = 0;
    static tradeValues: Array<any> = [
        { name: '+350% / +400%', size: 0, color: 'purple' },
        { name: '+250% / +350%', size: 80, color: 'red' },
        { name: '+100% / +250%', size: 40, color: 'yellow' },
        { name: '+0% / +100%', size: 25, color: 'lime' },
        { name: '-50% / +0%', size: 13.75, color: 'blue' },
        { name: '-50%', size: 1.5, color: 'white' },
    ];
    static selectedFief: number = 0;

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
        CreateSVG('factionSVG', 'position:absolute; z-index:1; display:none;');
        CreateSVG('diploSVG', 'position:absolute; z-index:1; display:none;');
        CreateSVG('tradeSVG', 'position:absolute; z-index:1; display:none; opacity: 0.5;');

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

    static LoadDiplomacy() {
        MapManager.diplomacies = JSON.parse(localStorage.getItem('stb3_diplomacy') || '{}');
    }

    static GenerateMap() {
        for(let color of MapManager.colors) {
            CreateGroup(color.color, 'factionSVG', color.id);
        }

        CreateGroup('rgb(0, 0, 255)', 'diploSVG', 'Y');
        CreateGroup('rgb(0, 255, 255)', 'diploSVG', 'A');
        CreateGroup('rgb(0, 255, 0)', 'diploSVG', 'F');
        CreateGroup('rgb(255, 255, 255)', 'diploSVG', 'N');
        CreateGroup('rgb(255, 127, 0)', 'diploSVG', 'H');
        CreateGroup('rgb(255, 0, 0)', 'diploSVG', 'W');

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
                    AddToGroup(line, fief.colorId, fief.colorId);
                    if(MapManager.factionId == fief.colorId) {
                        AddToGroup(line, fief.colorId, 'Y');
                    } else {
                        var notfound = true;

                        for(let id in MapManager.diplomacies) {
                            if(fief.colorId == id) {
                                AddToGroup(line, fief.colorId, MapManager.diplomacies[id]);
                                notfound = false;
                                break;
                            }
                        }

                        if(notfound) {
                            AddToGroup(line, fief.colorId, 'N');
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
                MapManager.selectedFief = parseInt(this.getAttribute('class'));
                document.getElementById('diplomaticOptions').style.display = '';

                if(MapManager.diplomacies[MapManager.selectedFief] != undefined) {
                    let input = <HTMLInputElement>document.querySelector('#diplomaticOptions input[value="' + MapManager.diplomacies[MapManager.selectedFief] + '"]');
                    input.checked = true;
                } else {
                    let input = <HTMLInputElement>document.querySelector('#diplomaticOptions input[value="N"]');
                    input.checked = true;
                }
            });
        }

        let options = document.querySelectorAll('#diplomaticOptions input[name=diploType]');
        for(let i = 0; i < options.length; ++i) {
            options[i].addEventListener('change', function() {
                MapManager.diplomacies[MapManager.selectedFief] = this.value;
                localStorage.setItem('stb3_diplomacy', JSON.stringify(MapManager.diplomacies));
            });
        }

        document.getElementById('importDiplo').addEventListener('click', function() {
            MapManager.diplomacies = JSON.parse((<HTMLInputElement>document.getElementById('diploImport')).value);
            localStorage.setItem('stb3_diplomacy', JSON.stringify(MapManager.diplomacies));
        });

        document.getElementById('exportDiplo').addEventListener('click', function() {
            (<HTMLInputElement>document.getElementById('diploExport')).value = JSON.stringify(MapManager.diplomacies);
        });

        document.getElementById('clearDiplo').addEventListener('click', function() {
            localStorage.setItem('stb3_diplomacy', '{}');
        });

        let icons = document.querySelectorAll('#game .icon');
        for(let i = 0; i < icons.length; ++i) {
            icons[i].addEventListener('click', function() {
                document.getElementById('tradeSVG').innerHTML = '';

                DrawCube();

                let style = window.getComputedStyle(this);

                for(let trade of MapManager.tradeValues) {
                    if(MapManager.scale != 0) {
                        MapManager.AddTradeCircle(parseInt(style.left) / MapManager.scale, parseInt(style.top) / MapManager.scale, trade.size, trade.color);
                    }
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
        DrawCircle(x.toString(), y.toString(), (size * MapManager.pixelPerKm).toString(), 'black', '2', color);
    }
}