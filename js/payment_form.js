$(document).ready(() => {
    // Don't load if older EM is enabeld
    if (typeof CTRIpayments === "object") return
    const module = ExternalModules.UWMadison.CTRItweaks

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
})