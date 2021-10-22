function toTitleCase(str) {
    return str.replace('_',' ').replace('-',' ').replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

function getEventID(eventDisplayName) {
    var r = ""
    $.each( CTRItweaks.ReportWriteBack['general']['eventMap'], function(eventID, data) {
        if( data['display'] == eventDisplayName ) {
            r = eventID;
            return false;
        }
    });
    return r;
}

function gatherDataforPost() {
    var url = new URL(window.location.href);
    var id_index = $("#report_table th:contains("+CTRItweaks.ReportWriteBack['general']['record_id']+")").index();
    var event_index = $("#report_table th:contains('redcap_event_name')").index();
    var instrument_index = $("#report_table th:contains('redcap_repeat_instrument')").index();
    var instance_index = $("#report_table th:contains('redcap_repeat_instance')").index();
    var post_data = { 
        'pid': Number(url.searchParams.get("pid")),
        'prefix': CTRItweaks.modulePrefix,
        'write': []
    };
    var header = $("#report_table thead tr").length;
    var writeValue;
    var counter = 0;
    var action;
    var totalRecords = $("#report_table tr:visible").slice(header).length
    $("#report_table tr:visible").slice(header).each( function( index, el ) {
        $.each( CTRItweaks.ReportWriteBack['config'][0]['write'], function(wbindex, wb) {
            writeValue = wb['val'];
            action = wb['radio'];
            if (wb['val'].includes('@TODAY'))
                writeValue = today;
            if (wb['val'].includes('@ASK'))
                writeValue = $("#"+wb['var']).val() || $("#"+wb['var']).prop('placeholder')
            if (wb['val'].includes('@INCREMENT')) {
                writeValue = (Number(writeValue) + counter).toString();
                counter++;
                if ( index+1 != totalRecords ){
                    if ( action=='both' ) //If inc and global then only update global on last
                        action = 'var';
                    else if ( action=='global') 
                        return;
                }
            }
            
            post_data['write'].push( {
                'record': $($(el).find('td')[id_index]).find('a').text(),
                'ignoreInstance': wb['eventStatic'] > 0,
                'event': wb['eventStatic'] || getEventID($($(el).find('td')[event_index]).text()),
                'instrument': $($(el).find('td')[instrument_index]).text().toLowerCase(),
                'instance': $($(el).find('td')[instance_index]).text(),
                'var': wb['var'],
                'global': wb['global'],
                'action': action,
                'val': writeValue,
                'overwrite': CTRItweaks.ReportWriteBack.config['0'].overwrite ? true : false
            } );
        });
    });
    console.log(post_data);
    return post_data;
}

function openWritebackModal() {
    if ( $("#report_table tr:contains(No results were returned)").length == 1 ||
         $("#report_table tr:contains(No matching records found)").length == 1 ||
         $("#report_table tbody tr:visible").length == 0
    ){
        Swal.fire({
            icon: 'info',
            iconHtml: "<i class='fas fa-database'></i>",
            title: "No Records",
            html: "Nothin' to do boss" ,
        });
        return;
    }
    if ( CTRItweaks.ReportWriteBack.config[0].done ) {
        Swal.fire({
            icon: 'info',
            iconHtml: "<i class='fas fa-database'></i>",
            title: "Already Written",
            html: "You've already written once to the database. \
                   Please refresh the page before writing again." ,
        });
        return;
    }
    Swal.fire({
        icon: 'question',
        title: 'Are you sure?',
        html: CTRItweaks.ReportWriteBack.html,
        footer: CTRItweaks.ReportWriteBack.config['0'].footer,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Write to DB'
    }).then( function(result) {
        if ( !result.value )
            return;
        $.ajax({
            method: 'POST',
            url: CTRItweaks.ReportWriteBack.general.post,
            data: {obj: JSON.stringify(gatherDataforPost())},
            error: function(jqXHR, textStatus, errorThrown){ 
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'There was an issue writing back to the database.\
                         If possible, leave this window open and contact a RedCap Administrator',
                })
            },
            success: function(data){ 
                console.log(data);
                CTRItweaks.ReportWriteBack.config[0].done = true;
                Swal.fire({
                  icon: 'success',
                  title: 'Write Back Complete',
                  text: 'All data was successfully written back to the database',
                })
            }
        });
    })
}

function monitorWBbutton() {
    if ($('[id="openWBmodal"]').length > 1)
        $('[id="openWBmodal"]').parent().remove();
    if ($("#openWBmodal").length == 0)
        placeWriteBackButton();
    else
        setTimeout(monitorWBbutton,1000);
}

function generateModalHTML() {
    var ask = `
    <div class="form-group mb-0">
        <label class='font-weight-bold float-left mt-4'>LABEL</label>
        <input type="text" class="swal2-input mt-0 mb-0" id="ID">
    </div>`
    var htmlModal = CTRItweaks.ReportWriteBack['config'][0]["text"];
    var id;
    var phval;
    $.each( CTRItweaks.ReportWriteBack.config['0'].write, function(index,wb) {
        if (wb.val.includes("@ASK")) {
            if ( wb['radio'] == 'var' || wb['radio'] == 'both') {
                id = `id="${wb['var']}"`
                htmlModal += ask.replace('LABEL',toTitleCase(wb['var'])).replace('ID',wb['var'])+'&nbsp;';
            } else if ( wb['radio'] == 'global') {
                id = `id="${wb['global']}"`
                htmlModal += ask.replace('LABEL',toTitleCase(wb['global'])).replace('ID',wb['global'])+'&nbsp;';
            }
            if ( wb['radio'] == 'global' || wb['radio'] == 'both') {
                if ( wb['global'] ) {
                    phval = CTRItweaks.systemSettings[wb['global']].value;
                    if (wb['val'].includes('@INCREMENT')) // Incrementing stored values store the last written value, so we need to +1
                        phval = Number(phval) + 1;
                    htmlModal = htmlModal.replace(id,`${id} placeholder="${phval}"`);
                }
            }
        }
    });
    CTRItweaks.ReportWriteBack.html = htmlModal;
}

function placeWriteBackButton() {
    if ( $("#report_div .d-print-none").length == 2 ) {
        var load = `
        <div style='margin-top:10px;'>
            <button id="openWBmodal" class="report_btn jqbuttonmed ui-button ui-corner-all ui-widget" style="font-size:12px;">
                <i class="fas fa-pencil-alt fs10"></i> ${CTRItweaks.ReportWriteBack['config'][0]["btn"]}
            </button>
        </div>`;
        $("#report_div .d-print-none").last().append(load);
        $("#openWBmodal").on("click",openWritebackModal);
        monitorWBbutton();
    }
    else {
        if ($('#report_load_progress2').is(":visible") || $('#report_load_progress').is(":visible"))
            setTimeout(placeWriteBackButton,1000)
        else
            window.requestAnimationFrame(placeWriteBackButton);
    }
}

$(document).ready(function () {
    //Todo - Only supporting 0th button - loop over the values sent back rather than just use 0th
    generateModalHTML();
    placeWriteBackButton();
});