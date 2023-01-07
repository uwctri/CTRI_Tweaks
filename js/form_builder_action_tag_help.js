$(document).ready(function () {

    const html = `
    <div id="ctriActionTags">
        <b>CTRI Custom Action Tags:</b>
        <table><tbody>
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
                    Transforms a notes box into a full-width persistant notes area that can be used to track multiple notes over time. Date, time and username are recorded with every note. On repeating instruments all notes are propogated forward for easy viewing. To sync the notes across multiple events append the '-EVENTS' modifier, i.e. @JSONNOTES-EVENTS. The form should not be a repeating instrument when using the '-EVENTS' modifier.
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
                    Similar to "@DEFAULT", but attempts to apply the default any time the feild is made visible (to prevent REDCap errors) and every time the form is loaded.
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
                    Perform a fuzzy search on text entered and return possible matches in a popover. By default fuzzy searches on its own variable in all other records. To search on a differant variable use @FUZZY=[example] .
                </td>
            </tr>
            <tr>
                <td class="nowrap actionTagButton">
                    <button class="btn btn-xs btn-rcred" >Add</button>
                </td>
                <td class="nowrap actionTagName">@CROSSPP</td>
                <td class="actionTagInfo">
                    Flag a field as using CTRI Tweaks Cross Project Piping, enable this feature via the CTRI EM config menu. Cross Project Piping works only in field labels, does not respect any of the colon modifiers (i.e. ":ampm" or ":value"), and always returns the value of the feild or, for checkboxes, as json encoded representation of field. Formatting is identical to regular piping, but "!!" must be prepended , i.e. !![event][field][instance] .
                </td>
            </tr>
        </tbody></table>
    </div>
    `

    $('head').append(`
    <style>
    #ctriActionTags {
        margin:10px 0 5px;
    }
    #ctriActionTags table {
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
    `);

    // Checking if field annotation is present on this page.
    if ($('#div_field_annotation').length === 0) {
        return;
    }

    $('body').on('dialogopen', function (event, ui) {
        if ($(event.target).prop('id') !== 'action_tag_explain_popup') return;
        $("#action_tag_explain_popup > div").last().before(html);
        $('.actionTagButton').on('click', function () {
            $('#field_annotation').val(trim($(this).next().text() + ' ' + $('#field_annotation').val()));
            highlightTableRowOb($(this).parent(), 2500);
        });
    });
});