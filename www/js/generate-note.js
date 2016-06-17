$('.example').click(function() {
    $('input[name="doc-url"]').val($(this).attr('href'));

    $('#generate').click();

    return false;
});

$('#generate').click(function() {
    var url = $('input[name="doc-url"]').val();
    var dc_note_id, dc_slug = null;

    if (url == '') {
        alert('Please paste in a DocumentCloud Note URL.');
        return;
    }

    var re = /https:\/\/www.documentcloud.org\/documents\/(.*?)\.html#.*\/a(\d+)/;
    match = re.exec(url);

    if (match) {
        dc_slug = match[1];
        dc_note_id = match[2];
    }
    else {
        alert('This does appear to be a valid DocumentCloud Note URL.');
    }

    // Generate seamus HTML embed code
    var embed = JST.note_ext({ dc_note_url: url, dc_note_id: dc_note_id});
    $('textarea[name="embed-code"]').val(embed);
    $('.results').show();

    /**** Generate preview ******/
    nprdc.embedNote(url, "#DC-note-example");
});

