///<reference path="Armoury/ArmouryManager.ts"/>
///<reference path="Map/MapManager.ts"/>

if(window.location.pathname == "/index.php" || window.location.pathname == "/") {
    MapManager.Start();
} else if (window.location.search == "?info" || window.location.search == "?inv" || window.location.search.indexOf('?info&msg=') != -1 || window.location.search.indexOf('?msg=') != -1) {
    ArmouryManager.Start();
}