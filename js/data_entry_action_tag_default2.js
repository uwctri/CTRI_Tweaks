$(document).ready(function () {
    $.each(CTRItweaks.default2, function(field,defaultValue) {
        $(`select, input, textarea`).on('change', function () {
            $(`*[name=${field}___radio][value=${defaultValue}]:visible`).prop('checked','checked');
            $(`*[name=${field}]:visible`).val(defaultValue);
        });
    });
    $('input').last().change(); // Some hidden redcap input
});