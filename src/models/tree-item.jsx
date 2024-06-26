export class TreeItem {
    constructor(name, id) {
      this.name = name;
      this.id = id;
    }
    get name(){
        return this.name;
    }
    set name(name){
        this.name = name
    }
    get id(){
        return this.id;
    }
    set id(id){
        this.id = id
    }
}