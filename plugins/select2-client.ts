import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
window.jQuery = window.$ = $

import select2 from 'select2';
select2();

$(document).ready(function() {
    $(document).on('select2:open', 'select.common-input.select2', function() {
        let parent = $(document).find('.select2-dropdown');
        parent.css('z-index', '9999');
    });

    $(document).on('select2:close', 'select.common-input.select2', function() {
        let parent = $(this).closest('.relative').find('.label-border');
        parent.css('z-index', '1299');
    });
});
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide('jquery', $);
    nuxtApp.provide('$', $);
});
