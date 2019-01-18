document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    document.body.addEventListener('animationend', event => {
        const flash = event.target;
        flash.parentNode.removeChild(flash);
    });
})