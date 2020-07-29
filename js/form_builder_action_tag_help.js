$(document).ready(function() {
    
    const actionTagHTML = `
    <div id="actionTagDiv">
        <b>CTRI Custom Action Tags:</b>
        <table id="actionTagTable"><tbody>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@MISSINGCODES</td>
                <td class="actionTagInfo">
                    Add buttons below a text box to allow for discrete coded answers. Full documentation on using this tag can be found <a href="https://ctri-redcap.dom.wisc.edu/documentation/howto_missingcode.html">here</a>.
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@LABEL</td>
                <td class="actionTagInfo">
                    Pipes the label of another element into the current element's label i.e. @LABEL=[foo] . Useful for creating consistant instrument headers.
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@JSONNOTES</td>
                <td class="actionTagInfo">
                    Transforms a notes box into a full-width persistant notes area that can be used to track multiple notes over time. Date, time and username are recorded with every note. On repeating instruments all notes are propogated forward for easy viewing.
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@MARKALL</td>
                <td class="actionTagInfo">
                    Adds a "Mark All as ____" button below a matrix when used in the "Field Annotation" of any matrix feild. The coded value should be specified i.e. @MARKALL=0 .
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@READONLY2</td>
                <td class="actionTagInfo">
                    Similar to the default "@READONLY", but only styles the actual input box rather than the whole row. Cosmetic only.
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@DEFAULT2</td>
                <td class="actionTagInfo">
                    Similar to "@DEFAULT", but applies the default when the feild is made visible to prevent REDCap errors.
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@TOMORROWBUTTON</td>
                <td class="actionTagInfo">
                    Adds a "Tomorrow" button below date feilds that populates the feild with the next work day.
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@FUZZY</td>
                <td class="actionTagInfo">
                    Perform a fuzzy search on text entered and return possible matches in a popover. By defauly fuzzy searches on its on variable in all other records. To search on a differant variable use @FUZZY=[example] .
                </td>
            </tr>
        </tbody></table>
    </div>
    `
    
    const actionTagCSS = `
    <style>
    #actionTagDiv {
        margin:10px 0 5px;
    }
    #actionTagTable {
        margin-top:1px;
        width:100%;
        border-bottom:1px solid #ccc;
        line-height:13px;
    }
    .actionTagName {
        background-color:#f5f5f5;
        color:#912B2B;
        padding:7px;
        font-weight:bold;
        border:1px solid #ccc;
        border-bottom:0;
        border-left:0;
        border-right:0;
    }
    .actionTagButton {
        text-align:center;
        background-color:#f5f5f5;
        color:#912B2B;
        padding:7px 15px 7px 12px;
        font-weight:bold;
        border:1px solid #ccc;
        border-bottom:0;
        border-right:0;
    }
    .actionTagInfo {
        font-size:12px;
        background-color:#f5f5f5;
        padding:7px;
        border:1px solid #ccc;
        border-bottom:0;
        border-left:0;
    }
    </style>
    `
    
    // Checking if field annotation is present on this page.
    if ($('#div_field_annotation').length === 0) {
        return;
    }
 
    $('body').on('dialogopen', function(event, ui) {
        let $popup = $(event.target);
        if ($popup.prop('id') !== 'action_tag_explain_popup') {
            // That's not the popup we are looking for...
            return;
        }
        $('head').append(actionTagCSS);
        $popup.find('div').last().before(actionTagHTML);
        
        $('.actionTagButton').on('click', function(){
            $('#field_annotation').val(trim($(this).next().text()+' '+$('#field_annotation').val())); 
            highlightTableRowOb($(this).parent(),2500);
        });
    });
});