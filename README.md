DeltaJS library
=========

Simple javascript component library.

## Installation

```bash
  npm i --save delta-js
```
## Create documentation

See result at _docs_ directory 
```bash
  npm run docs
```

## Example

Create an application with a custom control that displays the message when you click on it. 
The message text is specified using the "data-text-to-show" attribute.

**app/custom-application.js**
```js
import {Control} from "delta-js/control.js";

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
```
**app/custom-control.js**
```js
import {Control} from "delta-js/control.js";

export default class MyButton extends Control {
    on(){
        this.context.addEventListener("click", ()=>{
            alert(this.options.textToShow);
        });
    }
}
```

**index.html**
```html
<div data-app="app/custom-application.js">
    
    <button data-control="app/custom-control.js" data-text-to-show="I am clicked!">Click me</button>
    <button data-control="app/custom-control.js" data-text-to-show="Thank You!">And me</button>
</div>
```




