Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .reduce((res, key) => (res[key] = obj[key], res), {});

// Utilities that are added to EM obj
Object.assign(ExternalModules.UWMadison.CTRItweaks, {

    studyAddr: [
        ExternalModules.UWMadison.CTRItweaks.study || "",
        'University of Wisconsin',
        'School of Medicine and Public Health',
        '1930 Monroe St. Suite 200',
        'Madison, WI 53711-2027'
    ],

    makePrintObject: () => {
        return {
            pageSize: 'LETTER',
            pageMargins: [20, 30, 20, 40],
            defaultStyle: {
                fontSize: 10,
                bold: true
            },
            content: [],
            styles: {
                check: {
                    margin: [40, 35, 0, 0],
                },
                buffer: {
                    margin: [0, 10, 0, 10],
                },
                receipt: {
                    margin: [40, 0, 40, 0]
                },
                address: {
                    margin: [40, 85, 40, 0]
                }
            },
            images: {
                logo: ExternalModules.UWMadison.CTRItweaks.img_logo,
                signature: ExternalModules.UWMadison.CTRItweaks.signature || ExternalModules.UWMadison.CTRItweaks.no_signature
            }
        };
    },

    makePageObject: (subject, study, memo, cash, addr, study_addr, showLogo, showVoid) => {

        let [dollars, cents] = cash.split('.');
        cents = typeof cents === 'undefined' ? '00' : cents.padEnd(2, '0');
        const cash_format = (dollars + '.' + cents).padStart(7, '*');
        let words = ExternalModules.UWMadison.CTRItweaks.inWords(dollars) || 'Zero ';
        words = words.charAt(0).toUpperCase() + words.slice(1);
        const date = today_mdy.replace(/-/g, '/');
        const addrLength = 3; // Lines the address should use
        addr = addr.filter(x => x.trim() !== "").concat(Array(addrLength).fill(" ")).slice(0, addrLength);
        const studyAddrLen = 5;
        study_addr = study_addr.filter(x => x.trim() !== "").concat(Array(studyAddrLen).fill(" ")).slice(0, studyAddrLen);

        subject = subject || "MISSING NAME";
        study = study || "MISSING STUDY";

        let page = [
            {
                margin: [40, 0, 40, 0],
                stack: [
                    study_addr[0],
                    study_addr[1],
                    study_addr[2],
                    study_addr[3],
                    study_addr[4],
                ]
            },
            {
                margin: [0, 0, 60, 0],
                table: {
                    widths: ['*', 'auto', '10%', 'auto', '12%'],
                    body: [
                        ['', 'Amount:', '$' + cash_format, 'Date:', date],
                    ],
                },
                layout: {
                    defaultBorder: false,
                    paddingTop: function (i, node) { return 1; },
                    paddingLeft: function (i, node) { return -1; },
                }
            },
            {
                margin: [40, 46, 40, 0],
                stack: [
                    {
                        table: {
                            widths: ['*', 'auto', 'auto'],
                            body: [
                                [subject, 'Memo:', memo],
                            ],
                        },
                        layout: {
                            defaultBorder: false,
                            paddingBottom: function (i, node) { return -1; },
                            paddingLeft: function (i, node) { return 0; },
                        }
                    },
                    addr[0],
                    addr[1],
                    addr[2],
                ]
            },
            { text: ' ', style: 'buffer' },
            {
                style: 'check',
                stack: [
                    study_addr[0],
                    study_addr[1],
                    study_addr[2],
                    study_addr[3],
                    {
                        margin: [0, 0, 60, 0],
                        table: {
                            widths: ['*', 'auto', '12%'],
                            body: [
                                [study_addr[4], 'Date:', date]
                            ]
                        },
                        layout: {
                            defaultBorder: false,
                            paddingTop: function (i, node) { return -1; },
                            paddingLeft: function (i, node) { return 0; },
                        }
                    }
                ]
            },
            {
                margin: [0, 20, 60, 20],
                bold: true,
                fontSize: 10,
                stack: [
                    {
                        table: {
                            widths: ['11%', '*', 'auto', 'auto'],
                            body: [
                                ['Pay To The', '', '', ''],
                                ['Order Of',
                                    {
                                        text: subject,
                                        border: [false, false, false, true]
                                    },
                                    '$', cash_format
                                ],
                            ],
                        },
                        layout: {
                            defaultBorder: false,
                            paddingBottom: function (i, node) {
                                if (i === 0) return -5;
                                return 0;
                            },
                        }
                    },
                    {
                        table: {
                            widths: ['90%', '*'],
                            body: [
                                [
                                    {
                                        text: words + 'and ' + cents + '/100***',
                                        border: [false, false, false, true]
                                    },
                                    'Dollars'
                                ],
                            ],
                        },
                        layout: {
                            defaultBorder: false,
                        }
                    },
                    {
                        margin: [5, 35, 0, 20],
                        table: {
                            widths: ['*', '35%'],
                            body: [
                                [memo, 'SIGNATURE']
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
            },
            {
                image: 'signature',
                width: 100,
                absolutePosition: { x: 357, y: 412 }
            },
            {
                text: showVoid ? 'VOID AFTER 90 DAYS' : ' ',
                absolutePosition: { x: 376, y: 395 }
            },
            { text: ' ', style: 'buffer' },
            { text: study, style: 'receipt' },
            {
                style: 'receipt',
                table: {
                    widths: ['auto', '*', 'auto', '*', 'auto', '12%'],
                    body: [
                        ['Pay to:', subject, 'Amount:', '$' + cash_format, 'Date:', date],
                    ],
                },
                layout: 'noBorders'
            },
            {
                style: 'address',
                stack: [
                    {
                        table: {
                            widths: ['*', 'auto', 'auto'],
                            body: [
                                [subject, 'Memo:', memo],
                            ],
                        },
                        layout: 'noBorders'
                    },
                    addr[0],
                    addr[1],
                    addr[2],
                ]
            },
        ];

        if (showLogo) {
            page.push({
                image: 'logo', width: 30,
                absolutePosition: { x: 25, y: 36 }
            });
            page.push({
                image: 'logo', width: 30,
                absolutePosition: { x: 25, y: 275 }
            })
        }

        return page;
    },

    inWords: (num) => {
        const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        if ((num = num.toString()).length > 6) return 'overflow';
        n = ('000000' + num).substr(-6).match(/^(\d{1})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; var str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'hundred ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'thousand ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'hundred ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) : '';
        return str;
    },

    makeAddressObject: (street1, street2, city, state, zip, oneLine) => {
        oneLine = typeof oneLine === "undefined" ? false : oneLine;
        street1 = street1 || '';
        street2 = street2 || '';
        city = city || 'City';
        state = state || 'state';
        zip = zip || 'zip';
        if (oneLine) {
            return [
                street2 == "" ? street1 : street1 + ', ' + street2,
                city[0].toUpperCase() + city.slice(1) + ', ' + state.toUpperCase() + ' ' + zip,
                ''
            ];
        } else {
            return [
                street1 || '',
                street2 || '',
                city[0].toUpperCase() + city.slice(1) + ', ' + state.toUpperCase() + ' ' + zip
            ];
        }
    }
});

(() => {

    const module = ExternalModules.UWMadison.CTRItweaks

    const on_form = () => {
        $('head').append(`
            <style>
            .printCheckButton {
                float: right;
                margin-right: 30px;
                line-height: 20px;
                font-size: 13px;
            }
            </style>
        `)

        $(document).on('click', '.printCheckButton', () => {
            let missing = Object.filter(module.paymentData, x => x == "")
            delete missing['street2']
            if (Object.keys(missing).length) {
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Information',
                    text: 'Missing mandatory elements to print a check: ' + Object.keys(missing).join(', ')
                })
                return
            }
            const memo = $("[name=check_activity]").val()
            const cash = $("[name=check_amt]").val() || '00.00'
            const t = module.paymentData
            const addr = module.makeAddressObject(t.street1, t.street2, t.city, t.state, t.zip, true)
            let print = module.makePrintObject()
            print.content.push(...module.makePageObject(t.name, module.study, memo, cash, addr, module.studyAddr, module.showLogo, module.showVoid))
            pdfMake.createPdf(print).open()
        })

        $(".printCheckButton").prop('disabled', false)
    }

    const on_report = () => {
        const waitForLoad = () => {
            if ($("#report_table thead").length == 0 ||
                !$.fn.DataTable.isDataTable("#report_table")) { // Still Loading
                window.requestAnimationFrame(waitForLoad);
                return;
            }

            // Print Button
            const printBtn = `
            <div style='margin-top:10px;'>
                <button id="printCheckButton" class="report_btn jqbuttonmed ui-button ui-corner-all ui-widget" style="font-size:12px;">
                    <i class="fas fa-print fs10"></i> Print Checks
                </button>
            </div>`
            $("#report_div .d-print-none").eq(1).append(printBtn);

            // Mark as Printed Button
            const markBtn = `
            <div style='margin-top:10px;'>
                <button id="openCheckModal" class="report_btn jqbuttonmed ui-button ui-corner-all ui-widget" style="font-size:12px;">
                    <i class="fas fa-pencil-alt fs10"></i> Mark all as printed
                </button>
            </div>`;
            $("#report_div .d-print-none").eq(1).append(markBtn);
        };

        const printChecks = () => {
            const recordList = $(".rl:visible").map(function () {
                return $(this).text();
            }).toArray();

            const cashIndex = $("#report_table th:contains(check_amt)").index();
            const memoIndex = $("#report_table th:contains(check_activity)").index();

            let master = module.makePrintObject();
            $.each(module.paymentData, function (record, data) {
                if (!recordList.includes(record)) return;
                const memo = $(`#report_table td:contains(${record}):visible`).closest('tr').find('td').eq(memoIndex).text();
                const cash = $(`#report_table td:contains(${record}):visible`).closest('tr').find('td').eq(cashIndex).text();
                const addr = module.makeAddressObject(data['street1'], data['street2'], data['city'], data['state'], data['zip']);
                master.content.push(...module.makePageObject(data['name'], module.study, memo, cash, addr, module.studyAddr));
                master.content.push({ pageBreak: 'after', text: '' });
            });

            master.content.pop(); // Remove extra page break
            pdfMake.createPdf(master).open();
        }

        const gatherDataforPost = (checkNumber) => {
            let instanceIndex = $("#report_table th:contains('redcap_repeat_instance')").index();
            let data = {
                'report': Number(getParameterByName('report_id')),
                'write': []
            };
            $(".rl:visible").each(function (_, el) {
                let row = $(el).closest('tr').find('td');
                data['write'].push({
                    'record': $(el).text(),
                    'instance': row.eq(instanceIndex).text(),
                    'check': checkNumber++
                });
            });
            return data;
        }

        const openModal = () => {

            // Check if anything exists
            if ($("#report_table tr:contains(No results were returned)").length ||
                $("#report_table tr:contains(No matching records found)").length ||
                $("#report_table tbody tr:visible").length == 0) {
                Swal.fire({
                    icon: 'info',
                    iconHtml: "<i class='fas fa-database'></i>",
                    title: "No Records",
                    html: "Nothin' to do boss",
                });
                return;
            }

            // Check if already printed
            if (module.bulkPrintDone) {
                Swal.fire({
                    icon: 'info',
                    iconHtml: "<i class='fas fa-database'></i>",
                    title: "Already Written",
                    html: "You've already flaged these checks as printed." +
                        "Please refresh the page before writing again.",
                });
                return;
            }

            // Open the real modal
            const modal = `
            You are about to mark <b>all</b> checks visible on this report as printed. 
            The check issue date will be updated to today in Redcap and the check numbers will be logged starting at the number below.`;

            const footer = `
            <span><b>Reminder:</b> The recommended check number above may be incorrect if a check has been skipped, individually printed, or issued outside of Redcap.</span>`;

            const seed = Number(module.seed)
            Swal.fire({
                icon: 'question',
                title: 'Are you sure?',
                html: modal,
                input: 'number',
                inputPlaceholder: seed + 1,
                footer: footer,
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Flag as Printed'
            }).then(function (result) {
                const checkNumber = result.value || (seed + 1);
                module.ajax("bulk_payment", gatherDataforPost(checkNumber)).then((response) => {
                    console.log(response);
                    module.bulkPrintDone = true;
                    Swal.fire({
                        icon: 'success',
                        title: 'Write Back Complete',
                        text: 'All data was successfully written back to the database',
                    })
                }).catch((err) => {
                    console.log(err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'There was an issue writing back to the database.\
                             If possible, leave this window open and contact a RedCap Administrator',
                    })
                });
            })
        }

        $(document).on('click', '#openCheckModal', openModal);
        $(document).on('click', '#printCheckButton', printChecks);
        waitForLoad();
    }

    $(document).ready(() => {
        const isDataEntry = location.href.includes("DataEntry/index.php")
        const func = isDataEntry ? on_form : on_report
        func()
    })

})()