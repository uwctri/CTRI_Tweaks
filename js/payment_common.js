Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .reduce((res, key) => (res[key] = obj[key], res), {});

CTRItweaks.studyAddr = [
    CTRItweaks.study || "",
    'University of Wisconsin',
    'School of Medicine and Public Health',
    '1930 Monroe St. Suite 200',
    'Madison, WI 53711-2027'
];

CTRItweaks.makePrintObject = () => {
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
            logo: CTRItweaks.img_logo,
            signature: CTRItweaks.signature
        }
    };
}

CTRItweaks.makePageObject = (subject, study, memo, cash, addr, study_addr, showLogo, showVoid) => {

    let [dollars, cents] = cash.split('.');
    cents = typeof cents === 'undefined' ? '00' : cents.padEnd(2, '0');
    const cash_format = (dollars + '.' + cents).padStart(7, '*');
    let words = CTRItweaks.inWords(dollars) || 'Zero ';
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
}

CTRItweaks.inWords = (num) => {
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
}

CTRItweaks.makeAddressObject = (street1, street2, city, state, zip, oneLine) => {
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
