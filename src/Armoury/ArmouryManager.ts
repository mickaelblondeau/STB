///<reference path="ItemCategory.ts"/>
///<reference path="Item.ts"/>

enum SpecialItems {
    GOLD = -1,
    TROOPS = -2,
    UNKNOWN = -3,
    TRADE = -4
}

class ArmouryManager {
    static GREEN_QUALITY = 'rgba(0, 100, 0, 0.2)';
    static RED_QUALITY = 'rgba(100, 0, 0, 0.2)';
    static TROOP_ICON = 'http://i.imgur.com/lzkgfYe.png';
    static GOLD_ICON = 'http://i.imgur.com/GsvcGtg.png';
    static TRADE_ICON = 'http://i.imgur.com/o5WoZPb.png';
    static UNKNOWN_ICON = 'http://i.imgur.com/TSKPuy0.png';
    static SIEGE_ICON = 'http://i.imgur.com/k5t4Gi2.png';
    static categories: Array<ItemCategory> = [];
    static items: Array<Item> = [];
    static simulation: boolean = false;

    static Start() {
        ArmouryManager.InitCategories();
        ArmouryManager.FillCategoriesWithLocalData();

        if(isOnPage('news.php?inv')) {
            ArmouryManager.ScanItems();
        }

        if(isOnPage('news.php?info') || isOnPage('news.php?info&msg=') || isOnPage('news.php?msg=')) {
            debugFief();

            let forms = document.querySelectorAll('#info_page form');
            for(let i = 0; i < forms.length; ++i) {
                if(i == 1) {
                    forms[i].setAttribute('id', 'stb-char-inventory');
                    ArmouryManager.CreateContainer(false);
                }
                if(i == 2) {
                    forms[i].setAttribute('id', 'stb-fief-inventory');
                    ArmouryManager.CreateContainer(true);
                }
            }

            ArmouryManager.LoadCategoryBlock();
            ArmouryManager.LoadItems();

            for(let i = 0; i < forms.length; ++i) {
                if(i == 1) {
                    if(ArmouryManager.simulation) {
                        ArmouryManager.UpdateItemSimulationPage(false);
                    } else {
                        ArmouryManager.UpdateItemPage(false);
                    }
                }
                if(i == 2) {
                    if(ArmouryManager.simulation) {
                        ArmouryManager.UpdateItemSimulationPage(true);
                    } else {
                        ArmouryManager.UpdateItemPage(true);
                    }
                }
            }

            ArmouryManager.UpdateCategories();

            ArmouryManager.AddHelpers();
            ArmouryManager.AddFilters();
            ArmouryManager.AddPresets();

            ArmouryManager.EventsListeners();
        }

        if(isOnPage('news.php?buy')) {
            let localCategories = JSON.parse(localStorage.getItem('stb3_categories') || '{}');

            let categoryImage = document.querySelector('.shop_type.current img').getAttribute('src');
            let items = document.querySelectorAll('.item .itemstats');
            let ids: Array<number> = [];
            let categoryId = 'cat00';
            for(let i = 0; i < items.length; ++i) {
                let id = parseInt(items[i].getAttribute('rel').split('?i=')[1].split('&m=')[0]);
                let found = false;

                for(let category of ArmouryManager.categories) {
                    if(category.icon == categoryImage) {
                        categoryId = category.id;
                        for(let itemId of category.items) {
                            if(itemId == id) {
                                found = true;
                                break;
                            }
                        }
                        break;
                    }
                }

                if(!found) {
                    ids.push(id);
                }
            }

            localCategories[categoryId] = ids;

            localStorage.setItem('stb3_categories', JSON.stringify(localCategories));
        }
    }

    static CreateContainer(isFief: boolean) {
        let id = isFief ? 'stb-fief-container' : 'stb-char-container';
        let parent = isFief ? '#stb-fief-inventory' : '#stb-char-inventory';

        let div = document.createElement('div');
        div.setAttribute('id', id);

        let table = document.querySelector(parent + ' table[name=transfertable]');
        if(table) {
            document.querySelector(parent + ' table[name=transfertable] tbody').appendChild(div);
        } else {
            document.querySelector('#info_page fieldset form').appendChild(div);
            ArmouryManager.simulation = true;
        }
    }

    static InitCategories() {
        ArmouryManager.categories.push(new ItemCategory('cat00', 'img/equip_inv.png', 'Trade', []));
        ArmouryManager.categories.push(new ItemCategory('cat01', 'img/equip_horse.png', 'Horse',  [1,2,3,4,10,5,6,7,6049,6051,6050,8,524,525,6048,9,526,527,6190,7963,7962,7114,6051,6049,6050,6474,8636,8637,8638,8639,524,6048,525,526,527,6190,7963,7962,7114,6051,6049,6050,6474,8636,8637,8638,8639,524,6048,525,526,527]));
        ArmouryManager.categories.push(new ItemCategory('cat02', 'img/equip_throw.png', 'Throwing', [23,25,26,28,29,32,34,5142,46,47,48,36,38,30,539,40,42,44,23,25,528,46,28,26,29,536,47,48,6176,534,32,34,529,5142,537,535,36,8492,8493,38,30,8490,8491,7000,7001,539,6680,40,42,44,538,23,25,528,46,28,26,29,536,47,48,6176,534,32,34,529,5142,537,535,36,8492,8493,38,30,8490,8491,7000,7001,539,6680,40,42,44,538]));
        ArmouryManager.categories.push(new ItemCategory('cat03', ArmouryManager.SIEGE_ICON, 'Siege',  [528,536,534,529,537,535,538,6176,539]));
        ArmouryManager.categories.push(new ItemCategory('cat04', 'img/equip_body.png', 'Body Armor', [364,369,366,367,368,370,372,373,374,375,376,412,413,371,378,377,379,431,432,5393,5498,381,382,384,383,386,385,390,389,4722,391,5169,387,388,394,392,399,393,395,396,397,398,6060,416,400,417,5500,419,472,418,403,434,420,5501,437,438,3971,404,440,6059,365,401,402,414,415,421,422,423,424,425,426,427,428,429,430,433,5394,5919,442,443,3130,444,3137,4952,445,4723,5502,447,405,454,5738,5741,5507,407,408,409,410,411,459,5506,441,448,450,458,461,4947,4948,4949,4950,4951,446,5916,460,451,4957,439,5505,4958,5918,449,455,457,5739,5740,5742,456,6058,452,435,6062,6061,406,4955,453,4720,6063,4956,5504,5509,5499,462,463,4953,4954,436,3972,5917,469,5496,464,465,466,467,5508,473,474,475,4721,476,477,478,480,5503,5497,468,547,541,545,471,380,470,479,364,369,6479,366,367,368,370,372,373,374,375,376,412,413,6354,371,378,5393,377,379,431,432,6481,5498,6482,381,382,384,6802,383,386,385,390,6213,4722,389,6352,7135,7136,391,5169,387,388,394,392,399,6480,393,395,396,6353,397,398,5500,416,400,6060,417,7984,7985,419,472,418,403,6813,434,420,5501,437,7980,7981,438,3971,6803,404,6059,440,5394,5919,365,401,402,414,415,421,422,423,424,425,426,427,428,429,430,433,3130,442,443,3137,4952,6805,6806,444,8244,8245,7982,4723,5502,445,6485,7784,8246,6483,6484,6214,447,6486,7975,7976,5738,5741,405,454,5507,6807,8241,8242,8243,8247,8248,8249,5506,407,408,409,410,411,459,7143,441,448,7978,7979,6478,458,461,7146,5916,7782,446,6218,460,7137,7138,7139,7140,4947,4948,4949,4950,4951,450,451,7153,8250,4957,8238,8239,8240,8251,8515,6801,439,5505,5918,4958,7144,8235,8236,8237,8514,6219,449,455,7983,6217,5739,5740,5742,457,7147,7148,7149,7150,7151,7152,8252,456,8253,7145,6062,452,6058,435,6814,6815,8232,8233,8234,8254,4955,406,4720,453,8586,6061,6063,7977,7783,4956,5504,5509,6804,5499,6808,4953,4954,462,463,436,5917,7781,3972,6215,5496,469,464,465,466,6216,5508,467,6812,473,474,475,4721,6811,476,477,478,480,8255,8256,5503,5497,468,547,541,545,6809,471,6810,7142,380,7141,470,479]));
        ArmouryManager.categories.push(new ItemCategory('cat05', 'img/equip_head.png', 'Head Armor', [273,283,255,256,257,258,259,260,261,262,279,280,284,5915,263,295,268,264,265,266,267,294,298,299,5162,270,272,274,275,276,277,278,309,495,6057,271,286,281,285,5484,5168,287,288,289,290,291,292,312,348,282,269,300,293,296,5914,302,297,301,307,303,5159,5160,5161,304,353,5155,5156,5157,5163,5164,5165,305,317,319,321,306,308,311,3968,5733,310,326,347,349,350,5158,5730,5737,314,323,313,320,322,330,549,4938,5385,5386,315,324,325,5486,5487,5913,5494,6056,318,327,329,328,5492,5736,338,5483,5488,5489,5734,5910,494,5493,5731,331,504,546,5490,332,335,4944,5491,333,363,4939,4942,5166,334,336,337,361,3969,4941,4945,5167,5482,5735,5912,316,339,359,4943,5485,362,5384,340,360,507,6055,341,4940,5495,5732,5911,6054,342,503,540,5885,343,4946,5388,5389,506,5390,5391,5392,344,345,346,351,352,356,5154,354,355,357,5387,358,509,492,5383,273,283,256,257,258,259,260,261,262,279,280,255,284,5915,263,295,268,264,265,266,267,7971,7972,294,298,299,7973,7974,5162,270,272,274,275,276,277,278,309,6057,6350,8154,495,6800,271,286,281,285,5484,5168,287,288,289,290,7132,291,292,312,348,282,269,300,293,296,5914,7133,302,297,7130,301,307,5159,303,5160,5161,5155,5156,5157,5163,304,353,6351,5164,5165,305,317,319,321,306,7129,308,311,8516,5733,3968,6796,5158,310,326,347,349,350,5730,5737,6795,6797,314,323,7772,7773,7774,7775,7776,7777,313,320,322,549,8517,330,4938,7779,5385,5386,6210,6476,5913,315,324,325,5486,5487,6477,5494,6056,318,327,329,328,5736,5492,5910,8518,338,5734,5483,5488,5489,5731,5493,494,546,331,5490,7134,504,332,335,4944,5491,5166,8519,4939,333,4942,7780,363,5912,7970,5167,4941,334,336,337,4945,5735,361,5482,3969,316,6206,4943,339,359,5485,8155,5384,6209,362,6207,6208,340,7778,360,6055,507,5911,8520,8521,4940,341,5732,5495,6054,540,342,503,5885,7117,7118,7119,7120,7121,7122,5388,5389,6204,6205,4946,343,6348,5390,5391,5392,506,5154,6212,344,345,346,351,352,356,6349,6211,354,355,7131,5387,357,358,6798,6799,509,8230,8231,7756,492,5383]));
        ArmouryManager.categories.push(new ItemCategory('cat06', 'img/equip_leg.png', 'Leg Armor', [218,219,220,5479,5480,5727,6052,5906,222,223,221,224,4936,225,226,228,5153,227,229,5907,230,3966,4937,5729,5728,234,5908,235,238,6053,233,3967,5909,236,232,4935,244,237,231,239,243,240,242,241,218,219,5727,5479,5480,6792,6052,220,5906,7966,7967,222,223,221,224,4936,225,226,228,5153,227,5907,229,3966,230,7968,7969,4937,5728,5729,5908,234,6984,235,238,6053,5909,3967,233,7964,7965,236,4935,232,244,6793,237,231,239,243,6985,240,242,241,7115]));
        ArmouryManager.categories.push(new ItemCategory('cat07', 'img/equip_hand.png', 'Hand Armor', [245,246,5884,253,251,252,247,248,249,550,543,542,254,5481,533,245,6475,246,5884,6343,7770,7771,253,6341,6342,251,252,6338,6339,247,248,6345,6346,550,249,543,542,6344,254,6347,7116,5481,6794,6340,533]));
        ArmouryManager.categories.push(new ItemCategory('cat08', 'img/equip_polearm.png', 'Polearm', [552,89,90,91,491,132,101,92,111,5371,93,94,99,100,123,95,107,116,103,133,104,108,4754,96,109,4753,112,98,120,122,110,102,5856,118,5855,113,106,5857,119,105,114,5858,117,4692,124,115,97,126,128,531,532,530,552,89,90,91,491,132,92,111,5371,93,94,99,95,109,107,116,103,7897,100,104,108,4754,7898,96,4753,106,6682,112,98,120,122,110,133,5856,5855,6684,113,5857,119,105,114,6683,5858,7004,118,4692,124,101,123,6584,6585,6586,6587,6588,6589,6590,115,97,126,7896,7003,8683,531,532,530,6681,102,128,117,7899]));
        ArmouryManager.categories.push(new ItemCategory('cat09', 'img/equip_twohand.png', 'Two Handed', [502,129,130,137,131,136,139,134,138,519,147,143,189,140,142,149,135,150,148,146,144,517,518,145,152,151,153,154,158,141,155,156,3320,157,159,522,521,160,129,502,7017,130,137,7018,131,136,139,138,519,134,189,8454,142,135,140,148,147,145,146,152,7014,143,151,150,7015,158,149,154,518,6690,517,6697,6198,8682,7016,153,6691,8177,6332,144,6696,155,6692,6695,7764,156,6694,3320,6693,522,521,157,159,141,160,8178]));
        ArmouryManager.categories.push(new ItemCategory('cat10', 'img/equip_onehand.png', 'One Handed', [489,161,162,164,165,166,168,500,3322,167,173,172,551,171,554,169,163,5900,178,174,170,5372,177,180,175,184,179,185,187,183,181,190,186,499,191,188,200,192,197,196,201,182,176,205,206,202,194,3195,195,3194,193,207,516,203,211,209,208,204,6022,213,198,520,215,212,3192,214,3196,3298,217,3190,216,210,3193,3323,199,510,523,6021,3191,4755,489,161,162,164,165,166,168,551,500,3322,167,172,554,7010,169,163,173,5900,171,174,184,5372,178,170,7900,175,187,183,177,188,185,181,190,186,499,180,200,192,197,196,7011,182,6687,176,205,179,3195,191,194,198,201,3194,193,217,207,6686,7006,516,203,209,8175,202,206,208,204,211,520,195,215,6591,7012,3192,7007,3196,3298,6688,3190,7009,7013,216,8176,7005,3193,6022,8174,213,3323,210,199,510,212,6685,214,6689,7008,8173,523,6021,3191,4755]));
        ArmouryManager.categories.push(new ItemCategory('cat11', 'img/equip_shield.png', 'Shield', [490,497,488,508,52,49,53,58,51,50,54,60,59,55,74,75,79,56,57,62,80,505,496,498,61,493,72,64,66,70,73,548,501,77,85,76,6019,71,83,86,81,82,78,63,65,67,68,69,84,6018,87,6020,544,88,490,497,488,508,58,8171,54,60,59,55,74,75,79,56,57,62,80,505,496,498,61,7890,7891,7892,493,72,64,66,70,73,548,501,77,85,7893,7894,7895,76,7002,71,8172,86,81,82,78,63,65,67,68,69,84,83,6019,6018,544,87,6020,8687,88]));
        ArmouryManager.categories.push(new ItemCategory('cat12', 'img/equip_bow.png', 'Bow', [17,16,18,19,21,5141,22,20,17,16,8720,18,8721,19,22,20,21,5141,8719,8722,8612]));
        ArmouryManager.categories.push(new ItemCategory('cat13', 'img/equip_arrow.png', 'Arrow', [481,482,484,483,481,482,484,483]));
        ArmouryManager.categories.push(new ItemCategory('cat14', 'img/equip_crossbow.png', 'Crossbow',  [11,12,13,14,15,11,12,13,14,15,11,12,13,14,15]));
        ArmouryManager.categories.push(new ItemCategory('cat15', 'img/equip_bolt.png', 'Bolt',  [485,486,485,486,485,486]));
    }

    static FillCategoriesWithLocalData() {
        let localCategories = JSON.parse(localStorage.getItem('stb3_categories') || '{}');
        for(let id in localCategories) {
            for(let category of ArmouryManager.categories) {
                if(category.id == id) {
                    category.items = category.items.concat(localCategories[id]);
                    break;
                }
            }
        }
    }

    static LoadCategoryBlock() {
        let div = document.createElement('div');
        div.setAttribute('id', 'stb-categories');
        div.innerHTML = `
            <h4>Categories</h4>
        `;
        document.getElementById('stb-char-container').appendChild(div);

        for(let category of ArmouryManager.categories) {
            document.getElementById('stb-categories').appendChild(category.GetInfoElement());
        }

        div = document.createElement('div');
        div.setAttribute('style', 'clear: both');
        document.getElementById('stb-categories').appendChild(div);
    }

    static UpdateCategories() {
        for(let category of ArmouryManager.categories) {
            document.getElementById(category.id).querySelector('.count').textContent = category.count.toString();
            document.getElementById(category.id).querySelector('.current').setAttribute('data-count', category.count.toString());
        }
    }

    static ScanItems() {
        let items = document.querySelectorAll('#inv_page .item');
        for(let i = 0; i < items.length; ++i) {
            let currentItem = items[i];
            let itemName = currentItem.querySelector('.header .name').textContent;
            let rel = items[i].querySelector('.itemstats').getAttribute('rel').split('itemstats.php?i=')[1];
            let itemId = parseInt(rel.split('&m=')[0]);
            let loomLevel = parseInt(rel.split('&m=')[1]);
            let playerItemId = parseInt(items[i].querySelector('.itemvisibility ').getAttribute('name').split('itemvisibility[')[1].split(']')[0]);
            let count = parseInt(items[i].querySelector('.desc').textContent.split('Number: ')[1].split("\n")[0]);
            let item = new Item(itemId, playerItemId, loomLevel, itemName, count);
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
        ArmouryManager.items.push(new Item(SpecialItems.GOLD, SpecialItems.GOLD, 0, 'Gold', parseInt(document.querySelector('#sub > .block > div').textContent.split('Gold: ')[1].split("\n")[0])));
        ArmouryManager.items.push(new Item(SpecialItems.TROOPS, SpecialItems.TROOPS, 0, 'Troops', parseInt(document.querySelector('#sub > .block > div').textContent.split('Troops: ')[1].split("\n")[0])));
        let itemsJSON = localStorage.getItem('stb3_items') || '[]';
        let items = JSON.parse(itemsJSON);
        for(let item of items) {
            if(Item.Exist(item.p)) {
                ArmouryManager.items.push(new Item(item.i, item.p, item.l, item.n, item.c));
            }
        }
    }

    static UpdateItemPage(isFief: boolean) {
        let divId = isFief ? 'stb-fief-items' : 'stb-char-items';
        let containerId = isFief ? 'stb-fief-container' : 'stb-char-container';
        let parent = isFief ? '#stb-fief-inventory' : '#stb-char-inventory';

        let div = document.createElement('div');
        div.setAttribute('id', divId);
        document.getElementById(containerId).appendChild(div);

        let items = document.querySelectorAll(parent + ' table[name=transfertable] tr:not(:first-child)');
        for(let i = 0; i < items.length; ++i) {
            let id = items[i].querySelector('.in').getAttribute('name').split('transfer[')[1].split(']')[0];

            if(items[i].querySelector('.useall_hero')) {
                var count = parseInt(items[i].querySelector('.useall_hero').textContent.split(' (all)')[0]);
            } else {
                var count = parseInt(items[i].querySelector('.useall_loc').textContent.split(' (all)')[0]);
            }

            let itemId: number;
            if(id == 'gold') {
                itemId = SpecialItems.GOLD;
            } else if(id == 'troops') {
                itemId = SpecialItems.TROOPS;
            } else {
                itemId = parseInt(id);
            }
            let item = ArmouryManager.FindItemById('item-' + itemId + '-' + (isFief ? 1 : 0));
            if(item) {
                item.updateCategory(count, isFief);
                document.getElementById(divId).appendChild(item.GetInfoElement());
            } else {
                let loomContainer = items[i].querySelector('.mergeitemsInfo');
                if(loomContainer) {
                    let loom = items[i].querySelector('.mergeitemsInfo').textContent;
                    let newItem = new Item(SpecialItems.UNKNOWN, itemId, parseInt(loom), items[i].querySelector('b').textContent.replace(loom + ' ', '').replace(':', ''), count);
                    newItem.updateCategory(count, isFief);
                    ArmouryManager.items.push(newItem);
                    document.getElementById(divId).appendChild(newItem.GetInfoElement());
                } else {
                    let newItem = new Item(SpecialItems.TRADE, itemId, 0, items[i].querySelector('b').textContent.replace(':', ''), count);
                    newItem.updateCategory(count, isFief);
                    ArmouryManager.items.push(newItem);
                    document.getElementById(divId).appendChild(newItem.GetInfoElement());
                }
            }
            items[i].remove();
        }
        document.querySelector(parent + ' table[name=transfertable] tr').remove();
    }

    static UpdateItemSimulationPage(isFief: boolean) {
        let divId = isFief ? 'stb-fief-items' : 'stb-char-items';
        let containerId = isFief ? 'stb-fief-container' : 'stb-char-container';

        let div = document.createElement('div');
        div.setAttribute('id', divId);
        document.getElementById(containerId).appendChild(div);

        for(let item of ArmouryManager.items) {
            document.getElementById(divId).appendChild(item.GetInfoElement());
        }
    }

    static FindItemById(playerItemId: string): Item {
        for(let item of ArmouryManager.items) {
            if(item.GetBlockId() == playerItemId) {
                return item;
            }
        }
        return null;
    }

    static AddHelpers() {
        let div = document.createElement('div');
        div.setAttribute('id', 'stb-helpers');
        div.innerHTML = `
            <h4>Helpers</h4>
            <input type="button" id="stb_select_button" value="Select All" />
            <input type="button" id="stb_unselect_button" value="Unselect All" />
            <input type="button" id="stb_invert_button" value="Invert selection" />
            <input type="text" id="stb_split_value" style="width: 50px" placeholder="Split %" />%
            <input type="button" id="stb_split_button" value="Split" />
        `;

        let node = document.getElementById('stb-char-items');
        node.parentNode.insertBefore(div, node);

        document.getElementById('stb_select_button').addEventListener('click', function(event) {
            for(let item of ArmouryManager.items) {
                if(item.IsFilterable()) {
                    item.SetTotal();
                }
            }
        });
        document.getElementById('stb_unselect_button').addEventListener('click', function(event) {
            for(let item of ArmouryManager.items) {
                if(item.IsFilterable()) {
                    item.SetEmpty();
                }
            }
        });
        document.getElementById('stb_invert_button').addEventListener('click', function(event) {
            for(let item of ArmouryManager.items) {
                if(item.IsFilterable()) {
                    item.Invert();
                }
            }
        });
        document.getElementById('stb_split_button').addEventListener('click', function(event) {
            let splitValue = parseInt((<HTMLInputElement>document.getElementById('stb_split_value')).value);
            for(let item of ArmouryManager.items) {
                if(item.IsFilterable()) {
                    item.Split(splitValue);
                }
            }
        });
    }

    static AddFilters() {
        let div = document.createElement('div');
        div.setAttribute('id', 'stb-filters');
        div.innerHTML = `
            <h4>Filters</h4>
            <select id="stb_category_filter">
                <option value="-1">All categories</option>
            </select>
            <select id="stb_loom_comparator_filter">
                <option value=">=">&ge;</option>
                <option value=">">&gt;</option>
                <option value="=">=</option>
                <option value="<">&lt;</option>
                <option value="<=">&le;</option>
            </select>
            <select id="stb_loom_level_filter">
                <option value="-4">-4</option>
                <option value="-3">-3</option>
                <option value="-2">-2</option>
                <option value="-1">-1</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
            </select>
            <input type="text" id="stb_text_filter" placeholder="Search for items" />
        `;

        let node = document.getElementById('stb-char-items');
        node.parentNode.insertBefore(div, node);

        for(let category of ArmouryManager.categories) {
            let option = document.createElement('option');
            option.setAttribute('value', category.id);
            option.innerHTML = category.name;
            document.getElementById('stb_category_filter').appendChild(option);
        }

        document.getElementById('stb_category_filter').addEventListener('change', function() {
            ArmouryManager.UpdateShownItems();
        });

        document.getElementById('stb_loom_comparator_filter').addEventListener('change', function() {
            ArmouryManager.UpdateShownItems();
        });

        document.getElementById('stb_loom_level_filter').addEventListener('change', function() {
            ArmouryManager.UpdateShownItems();
        });

        document.getElementById('stb_text_filter').addEventListener('keyup', function() {
            ArmouryManager.UpdateShownItems();
        });
    }

    static UpdateShownItems() {
        let category = (<HTMLInputElement>document.getElementById('stb_category_filter')).value;
        let loomComparator = (<HTMLInputElement>document.getElementById('stb_loom_comparator_filter')).value;
        let loomLevel = parseInt((<HTMLInputElement>document.getElementById('stb_loom_level_filter')).value);
        let search = (<HTMLInputElement>document.getElementById('stb_text_filter')).value;
        for(let item of ArmouryManager.items) {
            item.UpdateVisibility(category, loomComparator, loomLevel, search);
        }
    }

    static AddPresets() {
        let div = document.createElement('div');
        div.setAttribute('id', 'stb-presets');
        div.innerHTML = `
            <h4>Presets</h4>
            <select id="stb_preset_saved">
                <option value="-1">Select a Preset</option>
            </select>
            <input type="button" id="stb_preset_saved_use" value="Use" />
            <input type="button" id="stb_preset_saved_delete" value="Delete" />

            <input type="text" id="stb_preset_export_value" placeholder="Exported data will appear here" />
            <input type="button" id="stb_preset_export" value="Export" />

            <input type="text" id="stb_preset_import_value" placeholder="Put your data here to import" />
            <input type="button" id="stb_preset_import" value="Import" />

            <input type="text" id="stb_preset_save_value" placeholder="Save preset name" />
            <input type="button" id="stb_preset_save" value="Save" />
        `;

        let node = document.getElementById('stb-char-items');
        node.parentNode.insertBefore(div, node);

        let presets = ArmouryManager.LoadPresets();
        for(let key in presets) {
            ArmouryManager.AddPresetOption(key);
        }

        document.getElementById('stb_preset_saved_use').addEventListener('click', function() {
            let presets = ArmouryManager.LoadPresets();

            let saveName = (<HTMLInputElement>document.getElementById('stb_preset_saved')).value;

            if(presets[saveName]) {
                ArmouryManager.JSONToCurrentSelection(JSON.stringify(presets[saveName]));
            }
        });

        document.getElementById('stb_preset_saved_delete').addEventListener('click', function() {
            let presets = ArmouryManager.LoadPresets();

            let saveName = (<HTMLInputElement>document.getElementById('stb_preset_saved')).value;

            if(presets[saveName]) {
                delete presets[saveName];
                localStorage.setItem('stb3_presets', JSON.stringify(presets));
                document.querySelector('#stb_preset_saved option[value="' + saveName + '"]').remove();
            }
        });

        document.getElementById('stb_preset_export').addEventListener('click', function() {
            (<HTMLInputElement>document.getElementById('stb_preset_export_value')).value = JSON.stringify(ArmouryManager.CurrentSelectionToJSON());
        });

        document.getElementById('stb_preset_import').addEventListener('click', function() {
            ArmouryManager.JSONToCurrentSelection((<HTMLInputElement>document.getElementById('stb_preset_import_value')).value);
        });

        document.getElementById('stb_preset_save').addEventListener('click', function() {
            let presets = ArmouryManager.LoadPresets();

            let input = <HTMLInputElement>document.getElementById('stb_preset_save_value');
            let saveName = input.value;
            presets[saveName] = ArmouryManager.CurrentSelectionToJSON();

            localStorage.setItem('stb3_presets', JSON.stringify(presets));

            ArmouryManager.AddPresetOption(saveName);

            input.value = '';
        });
    }

    static LoadPresets(): { [name: string]: Object } {
        let localPresets = localStorage.getItem('stb3_presets') || '{}';
        return JSON.parse(localPresets);
    }

    static AddPresetOption(name: string) {
        let duplicate: Element = document.querySelector('#stb_preset_saved option[value="' + name + '"]');
        if(duplicate) {
            duplicate.remove();
        }
        let option = document.createElement('option');
        option.setAttribute('value', name);
        option.innerHTML = name;
        document.getElementById('stb_preset_saved').appendChild(option);
    }

    static CurrentSelectionToJSON() : Array<Object> {
        let results: Array<Object> = [];
        let items = document.querySelectorAll('.item');
        for(let i = 0; i < items.length; ++i) {
            let item = items[i];
            let loomLevel = item.getAttribute('data-loom');
            let itemId = item.getAttribute('data-id');
            let amount = parseInt((<HTMLInputElement>item.querySelector('.item-count-input')).value);
            if(amount > 0) {
                results.push({ i: itemId, l: loomLevel, a: amount });
            }
        }
        return results;
    }

    static JSONToCurrentSelection(response: string) {
        let results = JSON.parse(response);
        for(let i = 0; i < results.length; ++i) {
            let result = results[i];
            let itemDiv = document.querySelector('.item[data-id="' + result.i + '"].item[data-loom="' + result.l + '"]');
            (<HTMLInputElement>itemDiv.querySelector('.item-count-input')).value = result.a;
            let id = itemDiv.getAttribute('data-player-item-id');
            let item = ArmouryManager.FindItemById(id);
            item.ChangeValue();
        }
    }

    static EventsListeners() {
        let minusButtons = document.querySelectorAll('.remove-count-from-item');
        for(let i = 0; i < minusButtons.length; ++i) {
            minusButtons[i].addEventListener('click', function(event) {
                let id = this.parentElement.parentElement.parentElement.parentElement.getAttribute('data-player-item-id');
                let item = ArmouryManager.FindItemById(id);
                item.SubCount();
            });
        }

        let plusButtons = document.querySelectorAll('.add-count-to-item');
        for(let i = 0; i < plusButtons.length; ++i) {
            plusButtons[i].addEventListener('click', function(event) {
                let id = this.parentElement.parentElement.parentElement.parentElement.getAttribute('data-player-item-id');
                let item = ArmouryManager.FindItemById(id);
                item.AddCount();
            });
        }

        let totalButtons = document.querySelectorAll('.set-total-count');
        for(let i = 0; i < totalButtons.length; ++i) {
            totalButtons[i].addEventListener('click', function(event) {
                event.preventDefault();
                let id = this.parentElement.parentElement.parentElement.getAttribute('data-player-item-id');
                let item = ArmouryManager.FindItemById(id);
                item.SetTotal();
            });
        }

        let inputs = document.querySelectorAll('.item-count-input');
        for(let i = 0; i < inputs.length; ++i) {
            inputs[i].addEventListener('change', function(event) {
                let id = this.parentElement.parentElement.parentElement.getAttribute('data-player-item-id');
                let item = ArmouryManager.FindItemById(id);
                item.ChangeValue();
            });
        }
    }
}