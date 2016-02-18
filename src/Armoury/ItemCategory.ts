class ItemCategory {
    id: string;
    icon: string;
    name: string;
    items: Array<number>;

    constructor(id: string, icon: string, name: string, items: Array<number>) {
        this.id = id;
        this.icon = icon;
        this.name = name;
        this.items = items;
    }
}