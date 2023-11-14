export function getQueryVariable(variable: string) {
  var query = window.location['search'].substring(1);
  var vars = query.split('&');
  var i, pair, value;
  for (i = 0; i < vars.length; i++) {
    pair = vars[i].split('=');
    if (pair[0] === variable) {
      value = decodeURIComponent(pair[1]);
      return value;
    }
  }
  return null;
}

export function storageGetItem(storage: any, key: string) {
  if (!storage) return null;
  return storage.getItem(key);
}

export function storageRemoveItem(storage: any, key: string) {
  if (!storage) return null;
  return storage.removeItem(key);
}
export function storageClear(storage: any) {
  storage && storage.clear();
}

export function storageSetItem(storage: any, key: string, value: string) {
  storage && key && storage.setItem(key, value);
}

export function randomHexColor(inputString: string): string {
  // Use a hash function (e.g., DJB2) to generate a numeric hash from the input string
  let hash = 5381;
  for (let i = 0; i < inputString.length; i++) {
    hash = (hash * 33) ^ inputString.charCodeAt(i);
  }

  // Use the hash value to determine the dark RGB components
  const red = ((hash & 0xFF) % 128).toString(16).padStart(2, '0');
  const green = (((hash >> 8) & 0xFF) % 128).toString(16).padStart(2, '0');
  const blue = (((hash >> 16) & 0xFF) % 128).toString(16).padStart(2, '0');

  // Construct the hex color string
  const hexColor = `#${red}${green}${blue}`;

  return hexColor;
}

export function formatTime(timestamp) {
  let date = new Date(timestamp);
  let Y = date.getFullYear() + '-';
  let M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-';
  let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  let h =
    (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  let m =
    (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
    ':';
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return Y + M + D + h + m + s;
}

export function createDeferred() {
  const deferred: any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}
