class ItemCategory {
    id: string;
    icon: string;
    name: string;
    items: Array<number>;
    count: number = 0;

    used: Element;
    remaining: Element;
    total: Element;
    addCount: number = 0;
    removeCount: number = 0;

    constructor(id: string, icon: string, name: string, items: Array<number>) {
        this.id = id;
        this.icon = icon;
        this.name = name;
        this.items = items;
    }

    GetItemsCount(): number {
        return this.count;
    }

    GetInfoHTML(): string {
        return `
            <div id="${this.id}" class="line" style="float: left; width: 300px;">
                <img width="20" alt="Trade Icon" src="${this.icon}">
                ${this.name} (<span class="count">${this.GetItemsCount()}</span>)
                <span data-count="${this.GetItemsCount()}" class="current"></span>
                <span class="plus" style="color:green;"></span>
                <span class="less" style="color:red;"></span>
                <span class="total" style="color:orange;"></span>
            </div>
        `;
    }

    GetInfoElement(): Element {
        let node = document.createElement('div');
        node.innerHTML = this.GetInfoHTML();
        return node.firstElementChild;
    }

    GetAddElement(): Element {
        return this.used != null ? this.used : this.used = document.getElementById(this.id).querySelector('.plus');
    }

    GetRemoveElement(): Element {
        return this.remaining != null ? this.remaining : this.remaining = document.getElementById(this.id).querySelector('.less');
    }

    GetTotalElement(): Element {
        return this.total != null ? this.total : this.total = document.getElementById(this.id).querySelector('.total');
    }

    UpdateElements() {
        let addCount = '+' + this.addCount.toString();
        let removeCount = this.removeCount.toString();
        if(this.addCount == 0 && this.removeCount == 0) {
            addCount = '';
            removeCount = '';
        }

        let add = this.GetAddElement();
        add.textContent = addCount;

        let remove = this.GetRemoveElement();
        remove.textContent = removeCount;

        let total = this.GetTotalElement();
        if(this.addCount != 0 || this.removeCount != 0) {
            total.textContent = '=' + (this.count + this.removeCount + this.addCount).toString();
        } else {
            total.textContent = '';
        }
    }
}