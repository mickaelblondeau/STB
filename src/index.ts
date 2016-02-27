///<reference path="Armoury/ArmouryManager.ts"/>
///<reference path="Map/MapManager.ts"/>

let currentPageUrl = window.location.pathname + window.location.search;

function isOnPage(page: string): boolean {
    return currentPageUrl.indexOf(page) != -1;
}

if(window.location.pathname == '/index.php' || window.location.pathname == '/') {
    MapManager.Start();
} else if (isOnPage('news.php?info') || isOnPage('news.php?inv') || isOnPage('news.php?info&msg=') || isOnPage('news.php?msg=') || isOnPage('news.php?buy')) {
    ArmouryManager.Start();
}