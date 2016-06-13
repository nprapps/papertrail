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

    // https://www.documentcloud.org/documents/2708497-Angelos-Clemency-Final.html#annotation/a276751
    var re = /https:\/\/www.documentcloud.org\/documents\/(.*?)\.html#.*\/a(\d+)/;
    match = re.exec(url);

    if (match) {
        dc_slug = match[1];
        dc_note_id = match[2];
        console.log("dc_note_id:" + dc_note_id);
        console.log("dc_slug:" + dc_slug);
    }
    else {
        alert('This does appear to be a valid DocumentCloud Note URL.');
    }

    // Generate seamus HTML embed code
    var iframe = JST.note_embed({ dc_note_id: dc_note_id, dc_slug: dc_slug});
    $('textarea[name="embed-code"]').val(iframe);
    $('.results').show();

    /**** Generate preview ******/

    // Simulate loader script

    // Load css helper function
    var loadCSS = function(url, media) {
        var link   = document.createElement('link');
        link.rel   = 'stylesheet';
        link.type  = 'text/css';
        link.media = media || 'screen';
        link.href  = url;
        var head   = document.getElementsByTagName('head')[0];
        head.appendChild(link);
    };

    // Load corresponding CSS
    /*@cc_on
    /*@if (@_jscript_version < 5.8)
        loadCSS("//assets.documentcloud.org/note_embed/note_embed.css");
    @else @*/
        loadCSS("//assets.documentcloud.org/note_embed/note_embed-datauri.css");
    /*@end
    @*/

    var bits = dc_slug.split('-');
    var dc_slug_id = bits[0];
    var preview_url = 'https://www.documentcloud.org/documents/' + dc_slug_id + '/annotations/' + dc_note_id + '.js'
    console.log(preview_url);
    $.getScript('//assets.documentcloud.org/note_embed/note_embed.js').done(function () {
        // Wait for page load
        $(function () {
            //load document cloud note
            dc.embed.loadNote(preview_url, {container: '#DC-note-example'});
        });
    });
});

