(() => {

    const module = ExternalModules.UWMadison.CTRItweaks
    const page = Object.fromEntries(new URLSearchParams(location.search))
    const isDataEntry = location.href.includes("DataEntry/index.php")
    const isRecordHome = location.href.includes("DataEntry/record_home.php")
    const isRecordDashboad = location.href.includes("DataEntry/record_status_dashboard.php")
    const isHomeOrSetup = ["ProjectSetup", "index.php"].includes(location.pathname.split('/')[2])

    const time_picker = () => {
        $('input[fv=time]').on('change', (event) => {
            let el = event.target
            if (!$(el).val())
                return
            let time = $(el).val().toLowerCase()
            let isPM = time.includes('p')
            let isAM = time.includes('a')
            time = time.replace(/[\sapm]/g, '')
            if (time.replace(':', '').length > 4)
                return
            let [hours, mins] = time.split(':')
            hours = isAM && hours.slice(0, 2) == 12 ? "00" + hours.slice(2, hours.length) : hours
            isPM = isPM && hours.slice(0, 2) == 12 ? false : isPM
            if (hours && mins) {
                hours = isPM ? (parseInt(hours) + 12) % 24 : hours
            } else if (hours.length <= 2) { // Only hour
                mins = 0
                hours = isPM ? (parseInt(hours) + 12) % 24 : hours
            } else if (hours.length <= 4) {
                mins = hours.slice(-2)
                hours = hours.slice(0, hours.length - 2)
                hours = isPM ? (parseInt(hours) + 12) % 24 : hours
            }
            $(el).val(String(hours).padStart(2, '0') + ":" + String(mins).padStart(2, '0'))
        })
    }

    const hide_survey_tools = () => {
        let dc = $("#west .x-panel:contains(Data Collection)").first()
        dc.find(".hang:contains(Survey Distribution Tools)").remove()
        dc.find(".menuboxsub:contains(public survey link)").remove()
    }

    const hide_instruments = () => {
        if (!isDataEntry)
            return
        $(".formMenuList").remove()
        $(".menuboxsub").last().html(
            $(".menuboxsub").last().html().replace("Data Collection Instruments:", '')
        )
    }

    const hide_survey_option_email = () => {
        if (!isDataEntry)
            return
        $("#SurveyActionDropDownUl li").slice(1, 3).remove()
    }

    const hide_save_goto_next_record = () => {
        if (!isDataEntry)
            return
        $("a:contains(Save & Go To Next Record)").hide()
    }

    const prevent_enter_submit = () => {
        if (!isDataEntry)
            return
        const target = "input.x-form-text.x-form-field"
        if ($(target).length == 0) {
            window.requestAnimationFrame(prevent_enter_submit)
            return
        }
        $(target).off("keydown").keydown((e) => { e.keyCode != 13 })
    }

    const hide_send_survey_link = () => {
        if (page.__return)
            $("#provideEmail").html(`Sending survey links is currently disabled. 
            Please return to the survey below. If you are a provider then you 
            will be able to continue this survey by navigating back to this 
            insturment in REDCap.`.replaceAll('\n', '').replaceAll('    ', ''))
    }

    const stop_dag_record_rename = () => {
        if ((!isRecordHome && !isRecordDashboad) || page.id)
            return
        let url = new URL(`${app_path_webroot_full}redcap_v${redcap_version}/DataEntry/record_home.php`)
        url.searchParams.set('pid', pid)
        url.searchParams.set('id', module.next_record_id)
        url.searchParams.set('auto', 1)
        url.searchParams.set('arm', $('#arm_name_newid').length ? $('#arm_name_newid').val() : '1')
        $("button.btn-rcgreen").attr('onclick', '').off().on('click', () => window.location.href = url)
    }

    const rename_unverified_record = () => {
        const name = module.project_settings["unverified-name"]
        if (!isDataEntry || !name)
            return
        let html = $("td.nowrap:contains(Unverified)").html()
        $("td.nowrap:contains(Unverified)").html(html.replace('Unverified', name))
    }

    const show_home_page_alert = () => {
        const alert = module.project_settings["project-home-alert"]
        if (!isHomeOrSetup || !alert)
            return
        $(".col-12.mb-4").prepend(`
        <div class="alert alert-primary" role="alert" style="border-color:#b8daff!important"> 
            ${alert}
        </div>`)
    }

    const at_jsonnotes = () => {
        const jmodule = module["@JSONNOTES"]

        const compileNotes = (field_or_jsonObject) => {
            let dataSource = typeof field_or_jsonObject == "object" ? field_or_jsonObject : jmodule.data[field_or_jsonObject]
            let notes = dataSource["historic"] || ""
            let importantNotes = ""
            $.each(dataSource, function (ts, info) {
                if (["current", "historic"].includes(ts))
                    return
                let tmp = `${info.author}: ${info.note.replace(/\^/g, '"')}\n\n`
                if (!jmodule.noDate) {
                    tmp = `${ts.slice(0, 16) + ts.slice(19)} - ${tmp}`
                }
                if (info.important)
                    importantNotes = tmp + importantNotes
                else
                    notes = tmp + notes
            })
            return !importantNotes ? notes : importantNotes.slice(0, -1) + (new Array(40).join('-')) + '\n' + notes
        }

        const displayJSONnotes = (field) => {
            if ($.isEmptyObject(jmodule.data[field])) {
                $(`#${field}-tr .jsonNotesCurrent`).val('')
                return
            }
            $(`#${field}-tr .jsonNotesCurrent`).val(compileNotes(field))
        }

        const saveCurrentJSONnotes = (field, ts) => {
            $(`[name=${field}]`).val(JSON.stringify(jmodule.data[field]))
            if (typeof ts !== "undefined")
                jmodule.data[field].current = ts
        }

        const saveNewJSONnotes = (field) => {
            if (jmodule.editState[field])
                return
            if (jmodule.data[field].current) {
                delete jmodule.data[field][jmodule.data[field].current]
                delete jmodule.data[field].current
            }
            let ts = formatDate(new Date(), 'MM/dd/yyyy hh:mm:ssa').toLowerCase()

            if (!$(`#${field}-tr .jsonNotesNew`).val().trim())
                return

            jmodule.data[field][ts] = {
                important: $(`#${field}-tr .importantJson`).prop('checked'),
                author: $("#username-reference").text(),
                note: $(`#${field}-tr .jsonNotesNew`).val().replace(/\"/g, "^")
            }
            saveCurrentJSONnotes(field, ts)
        }

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
                                <span class="editLink" style="float:right"><a href="javascript:">edit</a></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </td>
        `

        $('head').append(`
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
                height:100%;
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
                background-color: #eee;
            }
            .jsonNotesNew {
                height: 180px;
                width: 97%!important;
            }
            .importantJson {
                transform: translateY(2px);
            }
        </style>`)

        jmodule.data = {}
        jmodule.editState = {}

        // Load all the JSON data
        $.each(jmodule.raw, function (field, json) {
            $(`#${field}-tr td`).hide()
            let label = $(`#label-${field} td`).first().text().trim()
            try {
                jmodule.data[field] = json ? JSON.parse(json) : {}
            } catch (e) {
                jmodule.data[field] = {}
                jmodule.data[field]["historic"] = "Historic Notes:\n" + json // Not JSON, just old non-json notes.
            }
            $(`#${field}-tr`).append(notesFieldTemplate.replace('LABEL', label))
            if (!label)
                $(`#${field}-tr .jsonNotesLabel`).remove()
            displayJSONnotes(field)
        })

        // Setup the pannel to be resized
        $(".panel-left").resizable({
            handleSelector: ".splitter",
            resizeHeight: false,
            create: () => $('.ui-icon-gripsmall-diagonal-se').remove()
        })

        // Save any new text entered
        $(".jsonNotesNew").on("change", function () {
            let field = $(this).closest('tr').prop('id').replace('-tr', '')
            if (jmodule.editState[field])
                return
            saveNewJSONnotes(field)
            displayJSONnotes(field)
        })

        // Enable flagging as important, just do a normal change
        $(".importantJson").on('click', () => $(".jsonNotesNew").change())

        // Enable edit button
        $(".editLink").on('click', function () {
            let field = $(this).closest('tr').prop('id').replace('-tr', '')
            if (jmodule.editState[field]) {
                let notes = $(`#${field}-tr .jsonNotesNew`).val().split('---').map(x => x.trim())
                let keys = Object.keys(jmodule.data[field])
                $.each(notes, function (index, note) {
                    if (note.trim())
                        jmodule.data[field][keys[index]].note = note
                    else
                        delete jmodule.data[field][keys[index]]
                })
                $(this).find('a').text('edit')
                jmodule.editState[field] = false
                saveCurrentJSONnotes(field)
                displayJSONnotes(field)
                $(`#${field}-tr .jsonNotesNew`).val('')
            } else {
                $(this).find('a').text('save changes')
                jmodule.editState[field] = true
                let notes = Object.entries(jmodule.data[field]).map(x => x[1]['note'].trim())
                $(`#${field}-tr .jsonNotesNew`).val(notes.join('\n---\n'))
            }
        })

        //Scroll the notes to the top (wait two frames)
        setTimeout(() => $('.jsonNotesCurrent').scrollTop(0), 32)
    }

    const at_matrix_markall = () => {
        const buttonTemplate = `
        <tr><td class="labelrc col-12" colspan="3">
            <button id="markAllMATRIX" class="btn btn-defaultrc btn-sm" style="float:rightmargin:5px 0">Mark All as NAME</button>
        </td></tr>`

        $.each(module["@MARKALL"], (matrix, codedValue) => {
            if (!codedValue || $(`#${matrix}-mtxhdr-tr`).length == 0)
                return
            let name = $(`#${matrix}-mtxhdr-tr`).next().find(`[value=${codedValue}]`).attr('label')
            $(`#${matrix}-mtxhdr-tr`).nextUntil('tr:not(.mtxfld)').last().after(buttonTemplate.replace("MATRIX", matrix).replace('NAME', name))
            $(`#markAll${matrix}`).off('click')
            $(`#markAll${matrix}`).on('click', (e) => {
                e.preventDefault()
                $(`.mtxfld:visible[mtxgrp=${matrix}] input[value=${codedValue}]`).click()
            })
            new MutationObserver((mutations) => {
                $.each(mutations, function () {
                    if (this.attributeName == "style" && $(this.target).attr('mtxgrp') == matrix) {
                        if ($(`.mtxfld:visible[mtxgrp=${matrix}]`).length == 0)
                            $(`#markAll${matrix}`).hide()
                        else
                            $(`#markAll${matrix}`).show()
                    }
                })
            }).observe($("#questiontable").get(0), {
                attributes: true,
                subtree: true,
                childList: true
            })
        })
    }

    const at_readonly = () => {
        $.each(module["@READONLY2"], (el) => {
            $(`#${el}-tr`).css("opacity", "1").find('select, input').css('backgroundColor', '#eee')
            $(`#${el}-tr`).find('input[type=checkbox]').css('opacity', '40%')
        })
    }

    const at_default2 = () => {
        const wait_time = 2000 // We fight with shazam if we load normally
        setTimeout(() => {
            $.each(module["@DEFAULT2"], function (field, defaultValue) {
                if (!defaultValue)
                    return
                $(`select, input, textarea, button`).on('change', function () {
                    if ([field, field + '___radio'].includes($(this).attr('name')) || $(`*[name=${field}]`).val() != "" || $(`*[name=${field}___radio]:checked`).length)
                        return
                    setTimeout(() => { // Wait for branching logic to make things visible
                        if (!defaultValue.includes('"') && $(`*[name=${field}___radio][value="${defaultValue}"]:visible`).length > 0)
                            $(`*[name=${field}___radio][value="${defaultValue}"]:visible`).prop('checked', 'checked').click()
                        else {
                            let fv = $(`*[name=${field}]:visible`).attr("fv")
                            if (fv && fv.split('_')[0] == "date") {
                                fv = fv.split('_')[1]
                                if (fv == "mdy")
                                    defaultValue = date_ymd2mdy(defaultValue)
                                if (fv == "dmy")
                                    defaultValue = date_ymd2dmy(defaultValue)
                            }
                            $(`*[name=${field}]:visible`).val(defaultValue)
                        }
                    }, 100)
                })
            })
            $('input').last().change()
        }, wait_time)
    }

    const at_tomorrowbtn = () => {
        const formatRedcapDate = (date, format) => {
            let month = (date.getMonth() + 1).padStart(2, '0')
            let day = (date.getDate()).padStart(2, '0')
            let year = date.getFullYear()
            format = format.split("_").slice(-1)
            return {
                "mdy": `${month}-${day}-${year}`,
                "dmy": `${day}-${month}-${year}`,
            }[format] ?? `${year}-${month}-${day}`
        }

        // Returns the Date Object for the next weekday
        const getNextWeekDay = () => {
            let t = new Date(new Date().setDate(new Date().getDate() + 1))
            if (t.getDay() == "6")
                t.setDate(t.getDate() + 2)
            return t
        }

        const buttonTemplate = `
            <button class= "jqbuttonsm ui-button ui-corner-all ui-widget tomorrowButton" style="margin:5px 0 5px 5px" > Tomorrow</button>`

        $.each(module["@TOMORROWBUTTON"], function () {
            let $inputBox = $(`input[name = ${this}]`)
            $inputBox.parent().find('span').before(buttonTemplate)
            $inputBox.parent().find('.tomorrowButton').on('click', function (event) {
                event.preventDefault()
                $inputBox.val(formatRedcapDate(getNextWeekDay(), $inputBox.attr('fv')))
            })
        })
    }

    const at_missingcode = () => {
        // Helper function, returns true if the field shouldn't be modified
        function ignoreCheck(field) {
            // field - Name of field as seen on the dom. This is always the variable name.
            return ($(`#questiontable input[name=${field}]`).closest("tr").hasClass("@READONLY") || // Check if read only
                $(`#questiontable input[name=${field}]`).hasClass("rci-calc") || // Check if its a calc field
                $(`#questiontable select[name=${field}]`).length > 0 || // Check if its a dropdown (or SQL)
                $(`#questiontable div[id=${field}-linknew]`).length > 0 || // Check if signature or file upload
                $(`#questiontable input[name=${field}]`).hasClass("sldrnum")) // Check if slider
        }

        const btnTemplate = `
        <div class="missingCodeButton">
            <button id="MC_FLD" class="btn btn-defaultrc btn-xs fsl1 CHKD" type="button">TITLE</button>
        </div>`
        const defaults = {
            "NA": { code: -6, zipcode: "99999-0006", email: "redcap-noreply@ictr.wisc.edu", time: "00:00", date: "01-01-1906", phone: "(608) 555-0106", text: "Not Applicable" },
            "PF": { code: -7, zipcode: "99999-0007", email: "redcap-noreply@ictr.wisc.edu", time: "00:00", date: "01-01-1907", phone: "(608) 555-0107", text: "Prefer not to answer" },
            "RF": { code: -7, zipcode: "99999-0007", email: "redcap-noreply@ictr.wisc.edu", time: "00:00", date: "01-01-1907", phone: "(608) 555-0107", text: "Refused" },
            "DC": { code: -7, zipcode: "99999-0007", email: "redcap-noreply@ictr.wisc.edu", time: "00:00", date: "01-01-1907", phone: "(608) 555-0107", text: "Declined" },
            "DK": { code: -8, zipcode: "99999-0008", email: "redcap-noreply@ictr.wisc.edu", time: "00:00", date: "01-01-1908", phone: "(608) 555-0108", text: "Don't Know" },
            "MS": { code: -9, zipcode: "99999-0009", email: "redcap-noreply@ictr.wisc.edu", time: "00:00", date: "01-01-1909", phone: "(608) 555-0109", text: "Missing" }
        }
        $('head').append(`
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
        </style>`)

        $.each(module["@MISSINGCODE"], (field, args) => {
            let $input = $(`#questiontable input[name=${field}]`)
            // Input not on form, its a type we should ignore, or the input it just being used for branching logic
            if ($input.length == 0 || ignoreCheck(field) || ($input.length == 1 && $input.parent().is('tbody')))
                return
            $.each(args.reverse(), function (_, arg) {
                let codeStr = ""
                let uniqueID = ""
                let fv = $input.attr("fv")
                let html = btnTemplate
                if (arg.length == 1) {
                    if (!defaults[arg[0]])
                        return
                    uniqueID = arg[0]
                    let info = defaults[uniqueID]
                    html = html.replace('MC', uniqueID).replace('FLD', field).replace('TITLE', info.text)
                    codeStr = info.code
                    if (!fv)
                        return
                    switch (fv) { // Replace w/ correct code
                        case "zipcode":
                        case "time":
                        case "email":
                        case "phone":
                            codeStr = info[fv]
                            break
                        case "number":
                        case "integer":
                            //Nothing to do
                            break
                        case "date_mdy":
                        case "date_dmy":
                            codeStr = info.date
                            break
                        case "datetime_mdy":
                        case "datetime_dmy":
                            codeStr = info.date + " " + info.time
                            break
                        case "datetime_seconds_mdy":
                        case "datetime_seconds_dmy":
                            codeStr = info.date + " " + info.time + ":00"
                            break
                        case "date_ymd":
                            codeStr = info.date.substr(6) + "-" + info.date.substr(0, 5)
                            break
                        case "datetime_ymd":
                            codeStr = info.date.substr(6) + "-" + info.date.substr(0, 5) + " " + info.time
                            break
                        case "datetime_seconds_ymd":
                            codeStr = info.date.substr(6) + "-" + info.date.substr(0, 5) + " " + info.time + ":00"
                            break
                        default:
                            codeStr = ""
                    }
                }
                // Assume using custom text & code ["Text","Code"]
                else if (arg.length == 2) {
                    uniqueID = arg[0].replace(/[@%#!$`\\|!`()']/g, '')
                    html = html.replace('MC', uniqueID).replace('FLD', field).replace('TITLE', arg[0].split("_").join(" "))
                    codeStr = arg[1]
                }

                // Add CSS if already clicked on load
                if ($input.val() == codeStr) {
                    html = html.replace('CHKD', "stateSelected")
                    $input.prop('readonly', true).addClass("fieldDisabled")
                }
                else
                    html = html.replace('CHKD', "")

                // Insert the button onto the page
                if (fv && (fv.startsWith("date") || fv.startsWith("time")))
                    $input.nextAll('[class=df]').after('<br>' + html)
                else
                    $input.after(html)

                // Attach on click event
                $(`#${uniqueID}_${field}`).on('click', function () {
                    if ($(this).hasClass("stateSelected")) {
                        $(this).removeClass("stateSelected")
                        $input.prop("readonly", false).val("").removeClass("fieldDisabled").change()
                    }
                    else { // A button was clicked for the first time. Turn all the others off except for the one clicked.
                        $.each($(`button[id$=_${field}]`), function () {
                            $(this).removeClass("stateSelected")
                        })
                        $(this).addClass("stateSelected")
                        $input.prop('readonly', true).val(codeStr).addClass("fieldDisabled").change()
                    }
                })
            })
        })
    }

    const at_fuzzy = () => {
        const makeHtml = (form, record, event, instance, matchedValue) => `
            <tr>
                <td style="min-width:40pxpadding-right:10px">
                    <a href="${location.pathname}?pid=${pid}&page=${form}&id=${record}&event_id=${event}&instance=${instance}">
                        ${record}
                    </a>
                </td>
                <td>${matchedValue}</td>
            </tr>`

        // Apply some CSS tweaks
        $("head").append(`
        <style>
            .popover-body:has(.fuzzyPop) {
                max-height: 240px;
                overflow-y: auto;
                scrollbar-width: thin;
            }
        </style>`)

        $.each(module["@FUZZY"].search, (field, data) => {
            const fuse = new Fuse(data, {
                keys: ['value'],
                threshold: 0.2
            })
            $(`input[name=${field}]`).on('keyup change', function () {
                const search = fuse.search($(this).val())
                let display = "No similar records found"
                if (search.length != 0) {
                    display = search.map((el) => {
                        el = el.item
                        return (page.record == el.record && page.event_id == el.event && page.instance == el.instance) ?
                            '' : makeHtml(el.instrument, el.record, el.event, el.instance, el.value)
                    }).join('')
                    display = `<table class="fuzzyPop">${display}</table>`
                }
                $(this).popover('dispose').popover({
                    title: 'Possible Matches',
                    content: display,
                    html: true,
                    sanitize: false,
                    container: 'body',
                    trigger: 'focus'
                }).popover('show')
            })
        })
    }

    $(document).ready(() => {
        $.each({
            "support-12-hour-input": time_picker,
            "hide-survey-tools": hide_survey_tools,
            "hide-instruments-on-forms": hide_instruments,
            "hide-send-survey-email": hide_survey_option_email,
            "hide-save-next-record": hide_save_goto_next_record,
            "prevent-enter-submit": prevent_enter_submit,
            "hide-send-survey-link": hide_send_survey_link,
            "stop-dag-rename": stop_dag_record_rename,
            "unverified-name": rename_unverified_record,
            "project-home-alert": show_home_page_alert,
            "@JSONNOTES": at_jsonnotes,
            "@MARKALL": at_matrix_markall,
            "@READONLY2": at_readonly,
            "@DEFAULT2": at_default2,
            "@TOMORROWBUTTON": at_tomorrowbtn,
            "@MISSINGCODE": at_missingcode,
            "@FUZZY": at_fuzzy
        }, (settingName, func) => {
            if (module.project_settings[settingName])
                func()
        })
    })

    // Always enabled
    if (isDataEntry) {
        // Redcap might autoscroll if a form has a lot of text at the top
        // This will prevent that in most places
        (() => {
            let a = $("#questiontable").find("input:visible, select:visible").not('.hiddenradio').not("tr[id$=__-tr] input, tr[id$=__-tr] select")
            if (a.length != 0)
                a.get(0).focus({ preventScroll: true })
        })()

        // Show all hidden data on a form w/ ctrl + `
        $(window).bind('keydown', function (event) {
            if ((event.ctrlKey || event.metaKey) && event.which == 192) {
                $("tr").show()
                $('input').prop("disabled", false)
            }
        })
    }
})()