import {Control} from "../../src/control.js";

export default class CustomApplication extends Control {
    constructor(loader, element, options){
        super(loader, element, options);
        console.log("Hey, let's start!");
    }
    on(){
        console.log("Load complete.");
        return super.on();
    }
}