$(document).ready(function () {
    $.each(CTRItweaks.readonly2, function() {
        $(`#${this}-tr`).css("opacity","1").find('select, input').css('backgroundColor','#eee')
        $(`#${this}-tr`).find('input[type=checkbox]').css('opacity','40%');
    });
});