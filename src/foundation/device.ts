export const isTouchDevice = (() => {
    const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    const mq = (query: string) => {
        if (!window.matchMedia) {
            return false;
        }
        return window.matchMedia(query).matches;
    }

    if (('ontouchstart' in window || navigator.maxTouchPoints) || (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch) {
        return true;
    }

    const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
})();
const USER_AGENT = navigator.userAgent.toLowerCase();

export const isIOS = /ipad|iphone|ipod/.test(USER_AGENT);
export const isIPHONE = /iphone/.test(USER_AGENT);
export const isIPAD = /ipad/.test(USER_AGENT);
export const isIPOD = /ipod/.test(USER_AGENT);
export const isAndroid = /android/.test(USER_AGENT);
export const isBlackBerry = /blackberry/.test(USER_AGENT);
export const isWebOS = /webos/.test(USER_AGENT);
export const isKindle = /silk|kindle/.test(USER_AGENT);
export const isAliAppBrowser = /aliapp/.test(USER_AGENT);
export const isTeamsAndroid = /teamsmobile-android/.test(USER_AGENT);

export const isTablet = !isAliAppBrowser && /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(USER_AGENT);
export const isMobile = (!isTablet || isTeamsAndroid) && (/mobile/.test(USER_AGENT) || isIOS || isAndroid || isBlackBerry || isWebOS || isKindle);
export const isDesktop = !isMobile && !isTablet && !isAndroid && !isIPHONE && !isIPAD && !isIPOD && !isKindle && !isWebOS;