$(document).ready(function () {
    $.each(CTRItweaks.default2, function(field,defaultValue) {
        if ( defaultValue == "" )
            return;
        $(`select, input, textarea, button`).on('change', function () {
            if ( [field,field+'___radio'].includes($(this).attr('name')) || $(`*[name=${field}]`).val() != "" || $(`*[name=${field}___radio]:checked`).length )
                return;
            setTimeout( function () { // Wait for branching logic to make things visible
                $(`*[name=${field}___radio][value="${defaultValue}"]:visible`).prop('checked','checked');
                $(`*[name=${field}]:visible`).val(defaultValue);
            }, 100);
        });
    });
    $('input').last().change(); // Some hidden redcap input
});