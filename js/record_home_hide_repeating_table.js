$(document).ready(function () {
    $.each( ctriTweaksHideRepeatingTable, function(_,instrument) {
        $("table[id^=repeat_instrument_table][id$="+instrument+"]").parent().remove();
    });
});