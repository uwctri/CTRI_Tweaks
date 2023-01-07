$(document).ready(() => {

    let default2Loaded = false

    const loadDefault2 = () => {
        if (default2Loaded)
            return;
        default2Loaded = true;
        $.each(CTRItweaks.default2, function (field, defaultValue) {
            if (isEmpty(defaultValue))
                return;
            $(`select, input, textarea, button`).on('change', function () {
                if ([field, field + '___radio'].includes($(this).attr('name')) || $(`*[name=${field}]`).val() != "" || $(`*[name=${field}___radio]:checked`).length)
                    return;
                setTimeout(() => { // Wait for branching logic to make things visible
                    if (!defaultValue.includes('"') && $(`*[name=${field}___radio][value="${defaultValue}"]:visible`).length > 0)
                        $(`*[name=${field}___radio][value="${defaultValue}"]:visible`).prop('checked', 'checked').click();
                    else {
                        let fv = $(`*[name=${field}]:visible`).attr("fv")
                        if (fv && fv.split('_')[0] == "date") {
                            fv = fv.split('_')[1];
                            if (fv == "mdy")
                                defaultValue = date_ymd2mdy(defaultValue);
                            if (fv == "dmy")
                                defaultValue = date_ymd2dmy(defaultValue);
                        }
                        $(`*[name=${field}]:visible`).val(defaultValue);
                    }
                }, 100);
            });
        });
        $('input').last().change(); // Some hidden redcap input
    }

    if (typeof Shazam !== "object") {
        loadDefault2();
        return;
    }
    let oldCallback = Shazam.beforeDisplayCallback;
    Shazam.beforeDisplayCallback = () => {
        if (typeof oldCallback === "function")
            oldCallback();
        loadDefault2();
    }
    setTimeout(loadDefault2, 2000);
});