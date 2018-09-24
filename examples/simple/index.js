import {DeltaControlLoader} from "../../src/control-loader.js";

class Loader extends DeltaControlLoader{
    get urlMap(){
        return {
            delta: "/delta-js/src",
            app: "/delta-js/examples/simple",
        }
    }

    resolve(url){
        const map = this.urlMap;
        if (url && url[0] === '@'){
            const p = url.indexOf("/");
            const alias = p === -1 ? url.substr(1) : url.substr(1, p - 1);
            if (alias in map){
                return map[alias] + url.substr(alias.length + 1);
            }
        }
        return url;
    }
}
let startTime = performance.now();
(new Loader()).load("#server_generated_id").then(()=>{
    console.log("Load complete: " + (performance.now() - startTime) + " milliseconds");
});