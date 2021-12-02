export function deepCloneAssign(origin = {}, ...args){
    for (let i in args) {
        for (let key in args[i]) {
            if(args[i].hasOwnProperty(key)){
                let value = args[i][key];
                if(value && typeof value === 'object'){
                    if(!(args[i][key] instanceof HTMLElement)){
                        value = deepCloneAssign(Array.isArray(value) ? [] : {}, origin[key], value)
                    }
                }
                origin[key] = value;
            }
        }
    }
    return origin;
}