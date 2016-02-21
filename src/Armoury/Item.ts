class Item {
    itemId: number;
    playerItemId: number;
    loomLevel: number = 0;
    name: string;
    count: number = 0;
    category: ItemCategory;

    constructor(itemId: number, playerItemId: number, loomLevel: number, name: string) {
        this.itemId = itemId;
        this.playerItemId = playerItemId;
        this.loomLevel = loomLevel;
        this.name = name;
    }

    GetJSON() {
        return { itemId: this.itemId, playerItemId: this.playerItemId, loomLevel: this.loomLevel, name: this.name };
    }

    GetCategory(): ItemCategory {
        for(let category in ArmouryManager.categories) {
            if(category.items.indexOf(this.itemId) != -1) {
                return category;
            }
        }
        return null;
    }

    GetImage(): string {
        if(this.playerItemId == SpecialItems.GOLD) {
            return ArmouryManager.GOLD_ICON;
        } else if(this.playerItemId == SpecialItems.TROOPS) {
            return ArmouryManager.TROOP_ICON;
        } else if(this.playerItemId == SpecialItems.UNKNOWN) {
            return ArmouryManager.UNKNOWN_ICON;
        } else {
            return 'loadimage.php?id=' + this.itemId + '&lvl=' + this.loomLevel;
        }
    }

    GetTooltip(): string {
        if(this.playerItemId == SpecialItems.GOLD || this.playerItemId == SpecialItems.TROOPS || this.playerItemId == SpecialItems.UNKNOWN) {
            return '';
        } else {
            return 'itemstats.php?i=' + this.itemId + '&m=' + this.loomLevel;
        }
    }

    GetItemId(): string {
        if(this.itemId == SpecialItems.GOLD) {
            return 'gold';
        } else if(this.itemId == SpecialItems.TROOPS) {
            return 'troops';
        } else {
            return this.itemId.toString();
        }
    }

    GetColor(): string {
        if(this.loomLevel > 0) {
            return 'background: ' + ArmouryManager.GREEN_QUALITY;
        } else if(this.loomLevel == 0) {
            return '';
        } else {
            return 'background: ' + ArmouryManager.RED_QUALITY;
        }
    }

    GetInfoHTML(): string {
        return `
            <div class="item" data-loom="${this.loomLevel}" data-name="${this.name}" data-category="" data-id="${this.GetItemId()}" style="${this.GetColor()}">
                <div class="header">
                    <img width="70" height="70" src="${this.GetImage()}" rel="${this.GetTooltip()}" title="${this.name}" class="itemstats">
                    <div class="name">${this.name}</div>
                </div>
                <div class="desc">
                    <center>
                        <a class="abutton">
                            <img src="img/ic_minus.png" style="vertical-align:middle" class="remove-count-from-item">
                        </a>
                        <input class="in item-count-input" id="hero_transfer_item_${this.GetItemId()}" name="transfer[${this.GetItemId()}]" value="0" data-max="${this.count}">
                        <a class="abutton">
                            <img src="img/ic_plus.png" style="vertical-align:middle" class="add-count-to-item">
                        </a>
                        <br>
                        <a href="#" class="set-total-count">${this.count} (all)</a>
                    </center>
                </div>
            </div>
        `;
    }

    GetInfoElement(): Element {
        let node = document.createElement('div');
        node.innerHTML = this.GetInfoHTML();
        return node.firstElementChild;
    }

}