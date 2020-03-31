$(document).ready(function () {
    $.each( CTRItweaks.HideRepeatingTable, function() {
        $(`table[id^=repeat_instrument_table][id$=${this}]`).parent().remove();
    });
});