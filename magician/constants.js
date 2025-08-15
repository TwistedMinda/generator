// Global constants and environment helpers

// Version displayed in HUD
const VERSION = 'v1.17';

// Force mobile mode on web for testing (when true, we behave as mobile even on desktop)
const TESTING_MOBILE_ON_WEB = true;

// Detect once if the current device is a real mobile/touch device
const IS_DEVICE = (function () {
    try {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || ('ontouchstart' in window)
            || (navigator.maxTouchPoints > 0);
    } catch (_) {
        return false;
    }
})();

// Whether the game should run in mobile mode (testing flag OR real device)
const IS_MOBILE = TESTING_MOBILE_ON_WEB || IS_DEVICE;


