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

    var re = /https:\/\/beta.documentcloud.org\/documents\/(.*?)#document\/p\d+\/a(\d+)/;
    var match = re.exec(url);

    var oldRe = /https:\/\/www.documentcloud.org\/documents\/(.*?)\.html#.*\/a(\d+)/;
    var oldMatch = oldRe.exec(url);

    if (match) {
        dc_slug = match[1];
        dc_note_id = match[2];
    } else if (oldMatch){
        dc_slug = oldMatch[1];
        dc_note_id = oldMatch[2];
    } else {
        alert('This does appear to be a valid DocumentCloud Note URL.');
    }

    // Generate Published URL to update DocumentCloud
    published_url = 'https://' + APP_CONFIG.S3_BUCKET + '/' + APP_CONFIG.PROJECT_SLUG + '/document.html?id=' + dc_slug;

    // Remove me before deploying
    // published_url = 'http://localhost:8000/document.html?id=' + dc_slug;

    if (match) published_url += '&beta=true'

    $('input[name="pulbished-url"]').val(published_url);

    // Generate seamus HTML embed code
    var embed = JST.note_ext({ dc_note_url: url, dc_note_id: dc_note_id});
    $('textarea[name="embed-code"]').val(embed);
    $('.results').show();

    /**** Generate preview ******/
    nprdc.embedNote(url, "#DC-note-example");
});

