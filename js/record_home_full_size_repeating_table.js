$(document).ready(function () {
    $.each( CTRItweaks.RepeatingTableFullSize, function() {
        $(`table[id^=repeat_instrument_table][id$=${this}]`).parent().removeClass().addClass('float-left');
    });
});
