$(document).ready(function () {
    CTRItweaks.missingcode.btnTemplate = `
        <div class="missingCodeButton">
            <button id="MC_FLD" class="btn btn-defaultrc btn-xs fsl1 CHKD" type="button">TITLE</button>
        </div>`;
    CTRItweaks.missingcode.defaults = {
        "NA": {code:-6,zipcode:"99999-0006",email:"redcap-noreply@ictr.wisc.edu",time:"00:00",date:"01-01-1906",phone:"(608) 555-0106",text:"Not Applicable"},
        "PF": {code:-7,zipcode:"99999-0007",email:"redcap-noreply@ictr.wisc.edu",time:"00:00",date:"01-01-1907",phone:"(608) 555-0107",text:"Prefer not to answer"},
        "RF": {code:-7,zipcode:"99999-0007",email:"redcap-noreply@ictr.wisc.edu",time:"00:00",date:"01-01-1907",phone:"(608) 555-0107",text:"Refused"},
        "DC": {code:-7,zipcode:"99999-0007",email:"redcap-noreply@ictr.wisc.edu",time:"00:00",date:"01-01-1907",phone:"(608) 555-0107",text:"Declined"},
        "DK": {code:-8,zipcode:"99999-0008",email:"redcap-noreply@ictr.wisc.edu",time:"00:00",date:"01-01-1908",phone:"(608) 555-0108",text:"Don't Know"},
        "MS": {code:-9,zipcode:"99999-0009",email:"redcap-noreply@ictr.wisc.edu",time:"00:00",date:"01-01-1909",phone:"(608) 555-0109",text:"Missing"} 
    };
    let css = `
    <style>
        .stateSelected {
            background-color: #DBF7DF;
        }
        .fieldDisabled {
            background-color: #CECECE !important;
        }
        .missingCodeButton {
            margin-top: 2px !important;
            display: inline-block;
            padding: 3px !important;
        }
    </style>
    `;
    $('head').append(css);
    
    $.each( CTRItweaks.missingcode.config, function(field, args) {
        let $input = $(`#questiontable input[name=${field}]`);
        // Input not on form, its a type we should ignore, or the input it just being used for branching logic
        if ( $input.length == 0 || ignoreCheck(field) || ($input.length == 1 && $input.parent().is('tbody')) )
            return;
        $.each(args.reverse(), function(_,arg) { 
            let codeStr = "";
            let uniqueID = "";
            let fv = $input.attr("fv");
            let html = CTRItweaks.missingcode.btnTemplate;
            if( arg.length == 1 ) {
                if( !CTRItweaks.missingcode.defaults[arg[0]] )
                    return;
                uniqueID = arg[0];
                let info = CTRItweaks.missingcode.defaults[uniqueID];
                html = html.replace('MC', uniqueID).replace('FLD', field).replace('TITLE', info.text);
                codeStr = info.code;
                if( !fv ) 
                    return
                switch( fv ) { // Replace w/ correct code
                    case "zipcode":
                    case "time":
                    case "email":
                    case "phone":
                        codeStr = info[fv];
                    break;
                    case "number":
                    case "integer":
                        //Nothing to do
                    break;
                    case "date_mdy":
                    case "date_dmy":
                        codeStr = info.date;
                    break;
                    case "datetime_mdy":
                    case "datetime_dmy":
                        codeStr = info.date + " " + info.time;
                    break;
                    case "datetime_seconds_mdy":
                    case "datetime_seconds_dmy":
                        codeStr = info.date + " " + info.time + ":00";
                    break;
                    case "date_ymd":
                        codeStr = info.date.substr(6) + "-" + info.date.substr(0,5);
                    break;
                    case "datetime_ymd":
                        codeStr = info.date.substr(6) + "-" + info.date.substr(0,5) + " " + info.time;
                    break;
                    case "datetime_seconds_ymd":
                        codeStr = info.date.substr(6) + "-" + info.date.substr(0,5) + " " + info.time + ":00";
                    break;
                    default:
                        codeStr = ""    
                }
            }
            // Assume using custom text & code ["Text","Code"]
            else if( arg.length == 2 ) {
                uniqueID = arg[0].replace(/[@%#!$`\\|!`()']/g,'');
                html = html.replace('MC', uniqueID).replace('FLD', field).replace('TITLE', arg[0].split("_").join(" "));
                codeStr = arg[1];
            }
            
            // Add CSS if already clicked on load
            if ($input.val() == codeStr) {
                html = html.replace('CHKD', "stateSelected");
                $input.prop('readonly', true).addClass("fieldDisabled");
            }
            else 
                html = html.replace('CHKD', "");
            
            // Insert the button onto the page
            if( fv && (fv.startsWith("date") || fv.startsWith("time")) )
                $input.nextAll('[class=df]').after('<br>'+html);
            else
                $input.after(html);
            
            // Attach on click event
            $(`#${uniqueID}_${field}`).on('click', function() {
                if ($(this).hasClass("stateSelected")) {
                    $(this).removeClass("stateSelected");
                    $input.prop("readonly", false).val("").removeClass("fieldDisabled").change();
                }
                else { // A button was clicked for the first time. Turn all the others off except for the one clicked.
                    $.each($(`button[id$=_${field}]`), function() {
                        $(this).removeClass("stateSelected");
                    });
                    $(this).addClass("stateSelected");
                    $input.prop('readonly', true).val(codeStr).addClass("fieldDisabled").change();
                }
            });
        });
    });


});

// Helper function, returns true if the field shouldn't be modified
function ignoreCheck( field ) {
    // field - Name of field as seen on the dom. This is always the variable name.
    return ( $(`#questiontable input[name=${field}]`).closest("tr").hasClass("@READONLY") || // Check if read only
             $(`#questiontable input[name=${field}]`).hasClass("rci-calc") || // Check if its a calc field
             $(`#questiontable select[name=${field}]`).length > 0 || // Check if its a dropdown (or SQL)
             $(`#questiontable div[id=${field}-linknew]`).length > 0 || // Check if signature or file upload
             $(`#questiontable input[name=${field}]`).hasClass("sldrnum") ) // Check if slider
}