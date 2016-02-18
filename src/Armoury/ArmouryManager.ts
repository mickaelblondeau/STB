///<reference path="ItemCategory.ts"/>
///<reference path="Item.ts"/>

enum SpecialItems {
    GOLD = -1,
    TROOPS = -2,
    UNKNOWN = -3,
}

class ArmouryManager {
    static GREEN_QUALITY = 'rgba(0, 100, 0, 0.2)';
    static RED_QUALITY = 'rgba(100, 0, 0, 0.2)';
    static LIGHTEST_GREY = 'rgba(0, 0, 0, 0.2)';
    static LIGHT_GREY = 'rgba(0, 0, 0, 0.5)';
    static TROOP_ICON = 'http://i.imgur.com/lzkgfYe.png';
    static GOLD_ICON = 'http://i.imgur.com/GsvcGtg.png';
    static TRADE_ICON = 'http://i.imgur.com/o5WoZPb.png';
    static UNKNOWN_ICON = 'http://i.imgur.com/TSKPuy0.png';
    static SIEGE_ICON = 'http://i.imgur.com/k5t4Gi2.png';

    static categories: Array<ItemCategory> = [];
    static items: Array<Item> = [];

    static Start() {
        ArmouryManager.InitCategories();
        if(window.location.search == '?inv') {
            ArmouryManager.ScanItems();
        }
        if(window.location.search == '?info' || location.href.indexOf('news.php?msg=') != -1) {
            ArmouryManager.LoadItems();
            ArmouryManager.UpdateItemPage();
            // controls (- + all)
            // add categories counters (update with current selection)
            // add select helpers (all, unselectall, invert, split)
            // add filters (categories, search text, loom)
            // add presets (save, load, export import)

            // not at trade range ?
            // fief owner ?
        }
    }

    static InitCategories() {
        ArmouryManager.categories.push(new ItemCategory('cat00', 'img/equip_inv.png', 'Trade', []));
        ArmouryManager.categories.push(new ItemCategory('cat01', 'img/equip_horse.png', 'Horse', [1,2,3,4,10,5,6,7,6049,6051,6050,8,524,525,6048,9,526,527]));
        ArmouryManager.categories.push(new ItemCategory('cat02', 'img/equip_throw.png', 'Throwing', [23,25,26,28,29,32,34,5142,46,47,48,36,38,30,539,40,42,44]));
        ArmouryManager.categories.push(new ItemCategory('cat03', ArmouryManager.SIEGE_ICON, 'Siege', [528, 536, 534, 529, 537, 535, 538, 6176, 539]));
        ArmouryManager.categories.push(new ItemCategory('cat04', 'img/equip_body.png', 'Body Armor', [364,369,366,367,368,370,372,373,374,375,376,412,413,371,378,377,379,431,432,5393,5498,381,382,384,383,386,385,390,389,4722,391,5169,387,388,394,392,399,393,395,396,397,398,6060,416,400,417,5500,419,472,418,403,434,420,5501,437,438,3971,404,440,6059,365,401,402,414,415,421,422,423,424,425,426,427,428,429,430,433,5394,5919,442,443,3130,444,3137,4952,445,4723,5502,447,405,454,5738,5741,5507,407,408,409,410,411,459,5506,441,448,450,458,461,4947,4948,4949,4950,4951,446,5916,460,451,4957,439,5505,4958,5918,449,455,457,5739,5740,5742,456,6058,452,435,6062,6061,406,4955,453,4720,6063,4956,5504,5509,5499,462,463,4953,4954,436,3972,5917,469,5496,464,465,466,467,5508,473,474,475,4721,476,477,478,480,5503,5497,468,547,541,545,471,380,470,479]));
        ArmouryManager.categories.push(new ItemCategory('cat05', 'img/equip_head.png', 'Head Armor', [273,283,255,256,257,258,259,260,261,262,279,280,284,5915,263,295,268,264,265,266,267,294,298,299,5162,270,272,274,275,276,277,278,309,495,6057,271,286,281,285,5484,5168,287,288,289,290,291,292,312,348,282,269,300,293,296,5914,302,297,301,307,303,5159,5160,5161,304,353,5155,5156,5157,5163,5164,5165,305,317,319,321,306,308,311,3968,5733,310,326,347,349,350,5158,5730,5737,314,323,313,320,322,330,549,4938,5385,5386,315,324,325,5486,5487,5913,5494,6056,318,327,329,328,5492,5736,338,5483,5488,5489,5734,5910,494,5493,5731,331,504,546,5490,332,335,4944,5491,333,363,4939,4942,5166,334,336,337,361,3969,4941,4945,5167,5482,5735,5912,316,339,359,4943,5485,362,5384,340,360,507,6055,341,4940,5495,5732,5911,6054,342,503,540,5885,343,4946,5388,5389,506,5390,5391,5392,344,345,346,351,352,356,5154,354,355,357,5387,358,509,492,5383]));
        ArmouryManager.categories.push(new ItemCategory('cat06', 'img/equip_leg.png', 'Leg Armor', [218,219,220,5479,5480,5727,6052,5906,222,223,221,224,4936,225,226,228,5153,227,229,5907,230,3966,4937,5729,5728,234,5908,235,238,6053,233,3967,5909,236,232,4935,244,237,231,239,243,240,242,241]));
        ArmouryManager.categories.push(new ItemCategory('cat07', 'img/equip_hand.png', 'Hand Armor', [245,246,5884,253,251,252,247,248,249,550,543,542,254,5481,533]));
        ArmouryManager.categories.push(new ItemCategory('cat08', 'img/equip_polearm.png', 'Polearm', [552,89,90,91,491,132,101,92,111,5371,93,94,99,100,123,95,107,116,103,133,104,108,4754,96,109,4753,112,98,120,122,110,102,5856,118,5855,113,106,5857,119,105,114,5858,117,4692,124,115,97,126,128,531,532,530]));
        ArmouryManager.categories.push(new ItemCategory('cat09', 'img/equip_twohand.png', 'Two Handed', [502,129,130,137,131,136,139,134,138,519,147,143,189,140,142,149,135,150,148,146,144,517,518,145,152,151,153,154,158,141,155,156,3320,157,159,522,521,160]));
        ArmouryManager.categories.push(new ItemCategory('cat10', 'img/equip_onehand.png', 'One Handed', [489,161,162,164,165,166,168,500,3322,167,173,172,551,171,554,169,163,5900,178,174,170,5372,177,180,175,184,179,185,187,183,181,190,186,499,191,188,200,192,197,196,201,182,176,205,206,202,194,3195,195,3194,193,207,516,203,211,209,208,204,6022,213,198,520,215,212,3192,214,3196,3298,217,3190,216,210,3193,3323,199,510,523,6021,3191,4755]));
        ArmouryManager.categories.push(new ItemCategory('cat11', 'img/equip_shield.png', 'Shield', [490,497,488,508,52,49,53,58,51,50,54,60,59,55,74,75,79,56,57,62,80,505,496,498,61,493,72,64,66,70,73,548,501,77,85,76,6019,71,83,86,81,82,78,63,65,67,68,69,84,6018,87,6020,544,88]));
        ArmouryManager.categories.push(new ItemCategory('cat12', 'img/equip_bow.png', 'Bow', [17,16,18,19,21,5141,22,20]));
        ArmouryManager.categories.push(new ItemCategory('cat13', 'img/equip_arrow.png', 'Arrow', [481,482,484,483]));
        ArmouryManager.categories.push(new ItemCategory('cat14', 'img/equip_crossbow.png', 'Crossbow', [11,12,13,14,15]));
        ArmouryManager.categories.push(new ItemCategory('cat15', 'img/equip_bolt.png', 'Bolt', [485,486]));
    }

    static ScanItems() {
        let items = document.querySelectorAll('#inv_page .item');
        for(let i = 0; i < items.length; ++i) {
            let currentItem = items[i];
            let itemName = currentItem.querySelector('.header .name').textContent;
            let rel = items[i].querySelector('.itemstats').getAttribute('rel').split('itemstats.php?i=')[1];
            let itemId = parseInt(rel.split('&m=')[0]);
            let loomLevel = parseInt(rel.split('&m=')[1]);
            let playerItemId = parseInt(items[i].querySelector('.desc .in').getAttribute('name').split('sell[')[1].split(']')[0]);
            let item = new Item(itemId, playerItemId, loomLevel, itemName);
            ArmouryManager.items.push(item);
        }
        ArmouryManager.SaveItems();
    }

    static SaveItems() {
        let jsonObj: Array<any> = [];
        for(let item of ArmouryManager.items) {
            jsonObj.push(item.GetJSON());
        }
        localStorage.setItem('stb3_items', JSON.stringify(jsonObj));
    }

    static LoadItems() {
        let itemsJSON = localStorage.getItem('stb3_items');
        if(itemsJSON != '') {
            let items = JSON.parse(itemsJSON);
            for(let item of items) {
                ArmouryManager.items.push(new Item(item.itemId, item.playerItemId, item.loomLevel, item.name));
            }
        }
        ArmouryManager.items.push(new Item(SpecialItems.GOLD, SpecialItems.GOLD, 0, 'Gold'));
        ArmouryManager.items.push(new Item(SpecialItems.TROOPS, SpecialItems.TROOPS, 0, 'Troops'));
    }

    static UpdateItemPage() {
        let items = document.querySelectorAll('table[name=transfertable] tr:not(:first-child)');
        for(let i = 0; i < items.length; ++i) {
            let id = items[i].querySelector('.in').getAttribute('id').split('hero_transfer_item_')[1];
            let count = parseInt(items[i].querySelector('.useall_hero').textContent.split(' (all)')[0]);
            let itemId: number;
            if(id == 'gold') {
                itemId = SpecialItems.GOLD;
            } else if(id == 'troops') {
                itemId = SpecialItems.TROOPS;
            } else {
                itemId = parseInt(id);
            }
            let item = ArmouryManager.FindItemById(itemId);
            if(item) {
                item.count = count;
                document.querySelector('table[name=transfertable] tbody').appendChild(item.GetInfoElement());
            } else {
                let loom = items[i].querySelector('.mergeitemsInfo').textContent;
                let newItem = new Item(itemId, SpecialItems.UNKNOWN, parseInt(loom), items[i].querySelector('b').textContent.replace(loom + ' ', '').replace(':', ''));
                newItem.count = count;
                ArmouryManager.items.push(newItem);
                document.querySelector('table[name=transfertable] tbody').appendChild(newItem.GetInfoElement());
            }
            items[i].remove();
        }
        document.querySelector('table[name=transfertable] tr').remove();
    }

    static FindItemById(playerItemId: number): Item {
        for(let item of ArmouryManager.items) {
            if(item.playerItemId == playerItemId) {
                return item;
            }
        }
        return null;
    }
}