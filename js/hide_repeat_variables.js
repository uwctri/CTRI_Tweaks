$(document).ready(function hrv() {
    var rtbl = document.getElementById('report_table')
    // Call self until the report table is built in the dom
    if (rtbl == null) {
        window.requestAnimationFrame(hrv);
    }
    else {
        var haystack = ["Repeat Instrument","Repeat Instance"];
        var tcol = [];
        // Flip through the header to flag what cols we need to blow away
        for (let [j,col] of rtbl.rows[0].cells.entries()) {
            if ($.inArray(col.childNodes[0].data, haystack)>-1)
                tcol.push(j);
            if (tcol.length == 2) break;
        }
        // Flip through the table and delete the two cols
        for (let row of rtbl.rows) {
            row.cells[tcol[0]].remove()
            row.cells[tcol[1]-1].remove()
        }
    }
});