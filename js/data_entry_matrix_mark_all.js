$(document).ready(function () {
    const buttonTemplate = `
    <tr><td class="labelrc col-12" colspan="3">
        <button id="markAllMATRIX" class="btn btn-defaultrc btn-sm" style="float:right;margin:5px 0">Mark All as NAME</button>
    </td></tr>
    `;
    $.each( CTRItweaks.markAll, function(matrix, codedValue) {
        if ( !codedValue || $(`#${matrix}-mtxhdr-tr`).length == 0 )
            return;
        let name = $(`#${matrix}-mtxhdr-tr`).next().find(`[value=${codedValue}]`).attr('label');
        $(`#${matrix}-mtxhdr-tr`).nextUntil('tr:not(.mtxfld)').last().after(buttonTemplate.replace("MATRIX",matrix).replace('NAME',name));
        $(`#markAll${matrix}`).off('click');
        $(`#markAll${matrix}`).on('click', function(e) {
            e.preventDefault();
            $(`.mtxfld:visible[mtxgrp=${matrix}] input[value=${codedValue}]`).click();
        });
        let observer = new MutationObserver(function(mutations) {
            $.each( mutations, function() {
                if (this.attributeName == "style" && $(this.target).attr('mtxgrp') == matrix) {
                    if ( $(`.mtxfld:visible[mtxgrp=${matrix}]`).length == 0 )
                        $(`#markAll${matrix}`).hide();
                    else
                        $(`#markAll${matrix}`).show();
                }
            });
        }).observe($("#questiontable").get(0), {
          attributes: true,
          subtree: true, 
          childList: true
        });
    });
});