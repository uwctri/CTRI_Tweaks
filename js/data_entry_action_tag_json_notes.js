$(document).ready(function () {
    
    const notesFieldTemplate = `
    <td class="col-7 jsonNotesRow" colspan="2" style="background-color:#f5f5f5"> 
        <div class="container">
            <div class="row mb-3 mt-2 font-weight-bold"> LABEL </div>
            <div class="row panel-container">
                <div class="panel-left">
                    <textarea class="jsonNotesCurrent" readonly placeholder="Previous notes will display here"></textarea>
                </div>
                <div class="splitter"></div>
                <div class="panel-right">
                    <textarea class="jsonNotesNew" placeholder="Enter any notes here"></textarea>
                </div>
            </div>
        </div>
    </td>
    `;
    
    const css = `
    <style>
        .jsonNotesRow {
            border-bottom: 1px solid #DDDDDD;
            padding-left: 0.25rem;
            padding-right: 0;
        }
        .jsonNotesRow .container {
            padding-right: 0;
            height: 250px;
        }
        .panel-container textarea{
            border:none;
            resize: none!important;
            width:100%;
            height:100%
        }
        .panel-container {
            display: flex;
            flex-direction: row;
            border: 1px solid silver;
            overflow: hidden;
            xtouch-action: none;
            margin-right: 0.25rem;
        }
        .panel-left {
            flex: 0 0 auto;
            width: 300px;
            min-height: 200px;
            min-width: 186px;
            max-width:550px!important;
            white-space: nowrap;
        }
        .splitter {
            flex: 0 0 auto;
            width: 3px;  
            background-color: #535353;
            min-height: 200px;
            cursor: col-resize;  
        }
        .panel-right {
            flex: 1 1 auto;
            min-height: 200px;
        }
        .panel-right textarea {
            background-color: white;
        }
        .panel-left textarea {
            background-color: #eee
        }
    </style>
    `;
    $('head').append(css);
    CTRItweaks.jsonNotesData = {};
    
    // Load all the JSON data
    $.each( CTRItweaks.jsonNotes, function(field, json) {
        $(`#${field}-tr td`).hide()
        let label = $(`#label-${field} td`).first().text().trim();
        try {
            CTRItweaks.jsonNotesData[field] = json ? JSON.parse(json) : {};
        } catch(e) {
            CTRItweaks.jsonNotesData[field] = {};
            CTRItweaks.jsonNotesData[field]["historic"] = "Historic Notes:\n"+json; // Not JSON, just old non-json notes.
        }
        $(`#${field}-tr`).append(notesFieldTemplate.replace('LABEL',label));
        displayJSONnotes(field);
    });
    
    // Setup the pannel to be resized
    $(".panel-left").resizable({
        handleSelector: ".splitter",
        resizeHeight: false,
        create: function(event, ui) {
            $('.ui-icon-gripsmall-diagonal-se').remove();
        }
    });
    
    // Save any new text entered
    $(".jsonNotesNew").on("change", function() {
        let field = $(this).closest('tr').prop('id').replace('-tr','');
        saveNewJSONnotes( field );
        displayJSONnotes( field );
    });
    
    //Scroll the notes to the top (wait two frames)
    setTimeout( function() {
        $('.jsonNotesCurrent').scrollTop(0);
    },32);
});

function displayJSONnotes( field ) {
    if ($.isEmptyObject(CTRItweaks.jsonNotesData[field])) {
        $(`#${field}-tr .jsonNotesCurrent`).val('');
        return;
    }
    let notes = CTRItweaks.jsonNotesData[field]["historic"] || "";
    $.each(CTRItweaks.jsonNotesData[field], function(ts, info) {
        if ( ["current","historic"].includes(ts) )
            return;
        notes = `${ts.slice(0,15)+ts.slice(18)} - ${info.author}: ${info.note}\n\n` + notes;
    })
    $(`#${field}-tr .jsonNotesCurrent`).val(notes);
}

function saveNewJSONnotes( field ) {
    if ( CTRItweaks.jsonNotesData[field].current ) {
        delete CTRItweaks.jsonNotesData[field][CTRItweaks.jsonNotesData[field].current];
        delete CTRItweaks.jsonNotesData[field].current;
    }
    let ts = (new Date()).toLocaleString().split('/').map(x=>x.length<2?'0'+x:x).join('/').replace(/ /g,'').split(',').map(x=>x.length<10?'0'+x:x).join(' ');
    ts = ts.slice(0,19) + ts.slice(19).toLowerCase();
    
    if ( !$(`#${field}-tr .jsonNotesNew`).val().trim() )
        return;
    
    CTRItweaks.jsonNotesData[field][ts] = {
        author: $("#username-reference").text(),
        note: $(`#${field}-tr .jsonNotesNew`).val()
    };
    
    $(`[name=${field}]`).val( JSON.stringify(CTRItweaks.jsonNotesData[field]) );
    CTRItweaks.jsonNotesData[field].current = ts;
}