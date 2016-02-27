class Item {
    itemId: number;
    playerItemId: number;
    loomLevel: number = 0;
    name: string;
    count: number = 0;
    category: ItemCategory = null;
    input: HTMLInputElement;
    previousValue: string = '0';
    displayed: boolean = true;

    constructor(itemId: number, playerItemId: number, loomLevel: number, name: string, count: number) {
        this.itemId = itemId;
        this.playerItemId = playerItemId;
        this.loomLevel = loomLevel;
        this.name = name;
        this.count = count;

        for(let category of ArmouryManager.categories) {
            for(let itemId of category.items) {
                if(itemId == this.itemId) {
                    this.category = category;
                    this.category.count++;
                    break;
                }
            }
        }
        if(this.category == null && !this.IsSpecialItem()) {
            this.category = ArmouryManager.categories[0];
            this.category.count++;
        }
    }

    IsFilterable(): boolean {
        return this.displayed && !this.IsSpecialItem();
    }

    GetJSON() {
        return { i: this.itemId, p: this.playerItemId, l: this.loomLevel, n: this.name, c: this.count };
    }

    GetCategory(): ItemCategory {
        for(let category in ArmouryManager.categories) {
            if(category.items.indexOf(this.itemId) != -1) {
                return category;
            }
        }
        return null;
    }

    IsSpecialItem(): boolean {
        return this.playerItemId == SpecialItems.GOLD || this.playerItemId == SpecialItems.TROOPS;
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
            <div class="item" id="item-${this.playerItemId}" data-player-item-id="${this.playerItemId}" data-loom="${this.loomLevel}" data-name="${this.name}" data-category="" data-id="${this.GetItemId()}" style="${this.GetColor()}">
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

    GetCountInput(): HTMLInputElement {
        return this.input != null ? this.input : this.input = <HTMLInputElement>document.getElementById('item-' + this.playerItemId).querySelector('.item-count-input');
    }

    UpdateInput(input: HTMLInputElement, value: string) {
        input.value = value;
        this.previousValue = input.value;
    }

    SubCount() {
        let input = this.GetCountInput();
        let newValue = parseInt(input.value) - 1;
        if(newValue >= 0) {
            this.UpdateInput(input, newValue.toString());

            this.UpdateCategoryCount(-1);
        }
    }

    AddCount() {
        let input = this.GetCountInput();
        let newValue = parseInt(input.value) + 1;
        if(newValue <= this.count) {
            this.UpdateInput(input, newValue.toString());

            this.UpdateCategoryCount(1);
        }
    }

    SetTotal() {
        let input = this.GetCountInput();
        let previousValue = parseInt(input.value);
        this.UpdateInput(input, this.count.toString());

        let diff = this.count - previousValue;

        this.UpdateCategoryCount(diff);
    }

    SetEmpty() {
        let input = this.GetCountInput();
        let previousValue = parseInt(input.value);
        this.UpdateInput(input, '0');

        let diff = -previousValue;

        this.UpdateCategoryCount(diff);
    }

    Invert() {
        let input = this.GetCountInput();
        let previousValue = parseInt(input.value);
        let newValue = this.count - previousValue;
        this.UpdateInput(input, newValue.toString());

        let diff = newValue - previousValue;

        this.UpdateCategoryCount(diff);
    }

    Split(splitValue: number) {
        splitValue = splitValue < 0 ? 0 : splitValue;
        splitValue = splitValue > 100 ? 100 : splitValue;
        let input = this.GetCountInput();
        let previousValue = parseInt(input.value);
        let newValue = Math.round(this.count * splitValue / 100);
        this.UpdateInput(input, newValue.toString());

        let diff = newValue - previousValue;

        this.UpdateCategoryCount(diff);
    }

    ChangeValue() {
        let input = this.GetCountInput();
        input.value = parseInt(input.value) < 0 ? '0' : (parseInt(input.value) > this.count ? this.count.toString() : input.value);
        let diff = parseInt(input.value) - parseInt(this.previousValue);
        this.UpdateInput(input, input.value);

        this.UpdateCategoryCount(diff);
    }

    UpdateCategoryCount(diff: number) {
        if(this.category) {
            this.category.removeCount = (this.category.removeCount - diff);
            this.category.UpdateElements();
        }
    }

    Show() {
        document.getElementById('item-' + this.playerItemId).style.display = '';
        this.displayed = true;
    }

    Hide() {
        document.getElementById('item-' + this.playerItemId).style.display = 'none';
        this.displayed = false;
    }

    UpdateVisibility(category: string, loomComparator: string, loomLevel: number, search: string) {
        if(this.IsSpecialItem() || (this.IsCorrectCategory(category) && this.IsCorrectLoom(loomComparator, loomLevel) && this.IsCorrectSearch(search))) {
            this.Show();
        } else {
            this.Hide();
        }
    }

    IsCorrectCategory(category: string): boolean {
        return category == '-1' || category == this.category.id;
    }

    IsCorrectLoom(loomComparator: string, loomLevel: number): boolean {
        switch(loomComparator) {
            case '<=':
                return this.loomLevel <= loomLevel;
            case '<':
                return this.loomLevel < loomLevel;
            case '=':
                return this.loomLevel == loomLevel;
            case '>':
                return this.loomLevel > loomLevel;
            case '>=':
                return this.loomLevel >= loomLevel;
            default:
                return false;
        }
    }

    IsCorrectSearch(search: string): boolean {
        return search == '' || this.name.toLowerCase().indexOf(search.toLowerCase()) != -1;
    }
}