$(document).ready(() => {
    const makeHtml = (form, record, event, instance, matchedValue) => `
    <tr>
        <td style="min-width:40px;padding-right:10px">
            <a href="${location.pathname}?pid=${pid}&page=${form}&id=${record}&event_id=${event}&instance=${instance}">
                ${record}
            </a>
        </td>
        <td>${matchedValue}</td>
    </tr>`
    const url = new URLSearchParams(location.search);
    const record = url.get('id');
    const eventid = url.get('event_id');
    const instance = url.get('instance');
    
    // Apply some CSS tweaks
    $("head").append(`<style>
        .popover-body:has(.fuzzyPop) {
            max-height: 240px;
            overflow-y: auto;
            scrollbar-width: thin;
    }</style>`);
    
    $.each( CTRItweaks.fuzzy.search, (field, data) => {
        const fuse = new Fuse(data, {
            keys: ['value'],
            threshold: 0.2
        });
        $(`input[name=${field}]`).on('keyup change', function() {
            const search = fuse.search($(this).val());
            let display = "No similar records found";
            if (search.length != 0) {
                display = search.map( (el) => {
                    el = el.item;
                    return ( record == el.record && eventid == el.event && instance == el.instance ) ? 
                        '' : makeHtml(el.instrument, el.record, el.event, el.instance, el.value);
                }).join('');
                display = `<table class="fuzzyPop">${display}</table>`;
            }
            $(this).popover('dispose').popover({
                title: 'Possible Matches',
                content: display,
                html: true,
                sanitize: false,
                container: 'body',
                trigger: 'focus'
            }).popover('show');
        });
    });
});
