$(document).ready(function () {
    
    const notesFieldTemplate = `
    <td class="col-7 jsonNotesRow" colspan="2" style="background-color:#f5f5f5"> 
        <div class="mb-2 mt-1 font-weight-bold jsonNotesLabel"> LABEL </div>
        <div class="panel-container">
            <div class="panel-left">
                <textarea class="jsonNotesCurrent" readonly placeholder="Previous notes will display here"></textarea>
            </div>
            <div class="splitter"></div>
            <div class="panel-right">
                <div class="container">
                    <div class="row jsonTextRow">
                        <textarea class="jsonNotesNew" placeholder="Enter any notes here"></textarea>
                    </div>
                    <div class="row">
                        <div class="col pr-4">
                            <span>Important </span>
                            <input type="checkbox" class="importantJson" 
                                title="Flag as important and keep the note at the top." 
                                name="importantJson">
                            <span class="editLink" style="float:right"><a href="javascript:;">edit</a></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </td>
    `;
    
    const css = `
    <style>
        .panel-right .container {
            height: 100%;
        }
        .jsonTextRow {
            height: 90%;
        }
        .jsonNotesRow {
            border-bottom: 1px solid #ddd;
            padding-left: 0.25rem;
            padding-right: 0;
        }
        .jsonNotesRow .container {
            padding-right: 0;
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
        .jsonNotesNew {
            height: 180px;
            width: 97%!important;
        }
        .importantJson {
            transform: translateY(2px);
        }
    </style>
    `;
    $('head').append(css);
    CTRItweaks.jsonNotes.data = {};
    CTRItweaks.jsonNotes.editState = {};
    
    // Load all the JSON data
    $.each( CTRItweaks.jsonNotes.raw, function(field, json) {
        $(`#${field}-tr td`).hide()
        let label = $(`#label-${field} td`).first().text().trim();
        try {
            CTRItweaks.jsonNotes.data[field] = json ? JSON.parse(json) : {};
        } catch(e) {
            CTRItweaks.jsonNotes.data[field] = {};
            CTRItweaks.jsonNotes.data[field]["historic"] = "Historic Notes:\n"+json; // Not JSON, just old non-json notes.
        }
        $(`#${field}-tr`).append(notesFieldTemplate.replace('LABEL',label));
        if (!label)
            $(`#${field}-tr .jsonNotesLabel`).remove();
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
        if ( CTRItweaks.jsonNotes.editState[field] )
            return;
        saveNewJSONnotes( field );
        displayJSONnotes( field );
    });
    
    // Enable flagging as important, just do a normal change
    $(".importantJson").on('click', function() {
        $(".jsonNotesNew").change();
    });
    
    // Enable edit button
    $(".editLink").on('click', function() {
        let field = $(this).closest('tr').prop('id').replace('-tr','');
        if ( CTRItweaks.jsonNotes.editState[field] ) {
            let notes = $(`#${field}-tr .jsonNotesNew`).val().split('---').map(x=>x.trim());
            let keys = Object.keys(CTRItweaks.jsonNotes.data[field]);
            $.each ( notes, function(index,note) {
                if ( note.trim() )
                    CTRItweaks.jsonNotes.data[field][keys[index]].note = note;
                else 
                    delete CTRItweaks.jsonNotes.data[field][keys[index]];
            });
            $(this).find('a').text('edit');
            CTRItweaks.jsonNotes.editState[field] = false;
            saveCurrentJSONnotes( field );
            displayJSONnotes( field );
            $(`#${field}-tr .jsonNotesNew`).val('');
        } else {
            $(this).find('a').text('save changes');
            CTRItweaks.jsonNotes.editState[field] = true;
            let notes = Object.entries(CTRItweaks.jsonNotes.data[field]).map(x=>x[1]['note'].trim());
            $(`#${field}-tr .jsonNotesNew`).val( notes.join('\n---\n') );
        }
    });
    
    //Scroll the notes to the top (wait two frames)
    setTimeout( function() {
        $('.jsonNotesCurrent').scrollTop(0);
    },32);
});

function compileNotes( field_or_jsonObject ) {
    let dataSource = typeof field_or_jsonObject == "object" ? field_or_jsonObject : CTRItweaks.jsonNotes.data[field_or_jsonObject];
    let notes = dataSource["historic"] || "";
    let importantNotes = "";
    $.each(dataSource, function(ts, info) {
        if ( ["current","historic"].includes(ts) )
            return;
        let tmp = `${info.author}: ${info.note.replace(/\^/g,'"')}\n\n`;
        if ( !CTRItweaks.jsonNotes.noDate ) {
            tmp = `${ts.slice(0,16)+ts.slice(19)} - ${tmp}`;
        }
        if ( info.important )
            importantNotes = tmp + importantNotes;
        else
            notes = tmp + notes;
    });
    return !importantNotes ? notes : importantNotes.slice(0,-1) + (new Array(40).join('-')) + '\n' + notes;
}

function displayJSONnotes( field ) {
    if ($.isEmptyObject(CTRItweaks.jsonNotes.data[field])) {
        $(`#${field}-tr .jsonNotesCurrent`).val('');
        return;
    }
    $(`#${field}-tr .jsonNotesCurrent`).val( compileNotes(field) );
}

function saveCurrentJSONnotes( field, ts ) {
    $(`[name=${field}]`).val( JSON.stringify(CTRItweaks.jsonNotes.data[field]) );
    if ( typeof ts !== "undefined" )
        CTRItweaks.jsonNotes.data[field].current = ts;
}

function saveNewJSONnotes( field ) {
    if ( CTRItweaks.jsonNotes.editState[field] )
        return;
    if ( CTRItweaks.jsonNotes.data[field].current ) {
        delete CTRItweaks.jsonNotes.data[field][CTRItweaks.jsonNotes.data[field].current];
        delete CTRItweaks.jsonNotes.data[field].current;
    }
    let ts = formatDate(new Date(), 'MM/dd/yyyy hh:mm:ssa').toLowerCase();
    
    if ( !$(`#${field}-tr .jsonNotesNew`).val().trim() )
        return;
    
    CTRItweaks.jsonNotes.data[field][ts] = {
        important: $(`#${field}-tr .importantJson`).prop('checked'),
        author: $("#username-reference").text(),
        note: $(`#${field}-tr .jsonNotesNew`).val().replace(/\"/g,"^")
    };
    saveCurrentJSONnotes( field, ts );
}