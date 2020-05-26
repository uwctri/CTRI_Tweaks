$(document).ready(function () {
    CTRItweaks.fuzzy.html = `
    <tr class="fuzzyRow">
        <td style="min-width:40px;padding-right:10px">Record</td>
        <td>Value</td>
    </tr>`
    let url = new URLSearchParams(location.search);
    $.each( CTRItweaks.fuzzy.search, function(field, data) {
        const fuse = new Fuse(data, {keys: ['value']});
        $(`input[name=${field}]`).on('keyup change', function() {
            let search = fuse.search($(this).val());
            let display;
            if (search.length == 0) {
                display = "No similar records found";
            } else {
                display = search.map( function(value) {
                    value = value.item;
                    if ( url.get('id') == value.record && url.get('event_id') == value.event && url.get('instance') == value.instance )
                        return '';
                    return CTRItweaks.fuzzy.html.replace('Value', `"${value.value}"`)
                    .replace('Record', `<a href="${location.pathname}?pid=${pid}&page=${value.instrument}&id=${value.record}&event_id=${value.event}&instance=${value.instance}">${value.record}</a>`);
                }).join('');
                display = `<table>${display}</table>`;
            }
            if ( $(this).data("bs.popover") )
                $(this).popover('dispose');
            $(this).popover({
                title: 'Possible Matches',
                content: display,
                html: true,
                sanitize: false,
                container: 'body',
            });
            $(this).popover('show');
        });
    });
});
