import {Control} from "../../src/control.js";

export default class CustomControl extends Control {
    on(){
        this.context.addEventListener("click", e=>{
            e.preventDefault();
            alert(this.options.textToShow);
        });
    }
    get canHaveChildren(){
        return false;
    }
}