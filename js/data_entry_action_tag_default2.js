$(document).ready(function () {
    $.each(CTRItweaks.default2, function(field,defaultValue) {
        if ( defaultValue == "" )
            return;
        $(`select, input, textarea`).on('change', function () {
            if ( [field,field+'___radio'].includes($(this).attr('name')) || $(`*[name=${field}]`).val() != "" || $(`*[name=${field}___radio]:checked`).length )
                return;
            $(`*[name=${field}___radio][value=${defaultValue}]:visible`).prop('checked','checked');
            $(`*[name=${field}]:visible`).val(defaultValue);
        });
    });
    $('input').last().change(); // Some hidden redcap input
});