$(document).ready(function () {
    $.each( CTRItweaks.RepeatingTableFullSize, function(_,instrument) {
        $("table[id^=repeat_instrument_table][id$="+instrument+"]").parent().removeClass().addClass('float-left');
    });
});
