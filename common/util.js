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

// Load image
export function loadImage(url) {
    const image = new Image();
    return new Promise((resolve, reject) => {
      image.onerror = () => {
        reject();
      };
      image.onload = () => {
        resolve({
          width: image.width,
          height: image.height,
        });
      };
      image.src = url;
    });
}

export function getClientX (event) {
  if (event.type.indexOf('touch') === 0) {
      switch(event.type) {
          case 'touchstart':
          case 'touchmove':
              return event.touches[0].clientX;
          case 'touchend':
          case 'touchcancel':
              return event.changedTouches[0].clientX;
      }
  } else {
      return event.clientX;
  }
};

export function getClientY (event) {
  if (event.type.indexOf('touch') === 0) {
      switch(event.type) {
          case 'touchstart':
          case 'touchmove':
              return event.touches[0].clientY;
          case 'touchend':
          case 'touchcancel':
              return event.changedTouches[0].clientY;
      }
  } else {
      return event.clientY;
  }
};