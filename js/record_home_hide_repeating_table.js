$(document).ready(function () {
    $.each( CTRItweaks.HideRepeatingTable, function(_,instrument) {
        $("table[id^=repeat_instrument_table][id$="+instrument+"]").parent().remove();
    });
});