import {Control} from "../../src/control.js";

export default class CustomControl extends Control {
    on(){
        this.context.addEventListener("click", e=>{
            e.preventDefault();
            // noinspection JSUnresolvedVariable
            alert(this.options.textToShow);
        });
        return super.on();
    }
    get canHaveChildren(){
        return false;
    }
}