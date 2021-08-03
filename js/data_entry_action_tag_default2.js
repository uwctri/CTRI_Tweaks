CTRItweaks.default2Loaded = false;

$(document).ready(function () {
    if (typeof Shazam == "object") { 
        let oldCallback = Shazam.beforeDisplayCallback;
        Shazam.beforeDisplayCallback = function () {
            if (typeof oldCallback == "function") 
                oldCallback();
            loadDefault2();
        }
        setTimeout(loadDefault2, 2000);
    }
    else {
        loadDefault2();
    }
});

function loadDefault2() {
    if ( CTRItweaks.default2Loaded )
        return;
    CTRItweaks.default2Loaded = true;
    $.each(CTRItweaks.default2, function(field,defaultValue) {
        if ( defaultValue == "" )
            return;
        $(`select, input, textarea, button`).on('change', function () {
            if ( [field,field+'___radio'].includes($(this).attr('name')) || $(`*[name=${field}]`).val() != "" || $(`*[name=${field}___radio]:checked`).length )
                return;
            setTimeout( function () { // Wait for branching logic to make things visible
                if ( !defaultValue.includes('"') ) 
                    $(`*[name=${field}___radio][value="${defaultValue}"]:visible`).prop('checked','checked');
                $(`*[name=${field}]:visible`).val(defaultValue);
            }, 100);
        });
    });
    $('input').last().change(); // Some hidden redcap input
}

