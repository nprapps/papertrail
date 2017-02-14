var nprdc = (function () {
    function embedNote(url, container) {
        if (typeof $ !== 'undefined' && typeof $.getScript === 'function') {

            // Extract note_id and slug from url
            var re = /https:\/\/www.documentcloud.org\/documents\/(.*?)\.html#.*\/a(\d+)/;
            match = re.exec(url);
            if (match) {
                dc_slug = match[1];
                dc_note_id = match[2];
            }

            // Compose the note javascript url
            var note_url = 'https://www.documentcloud.org/documents/'+dc_slug+'/annotations/'+dc_note_id+'.js'

            // Simulate DocumentCloud loader script
            var loadCSS = function(url, media) {
                var link   = document.createElement('link');
                link.rel   = 'stylesheet';
                link.type  = 'text/css';
                link.media = media || 'screen';
                link.href  = url;
                var head   = document.getElementsByTagName('head')[0];
                head.appendChild(link);
            };

            //Check if we have the CSS in place if not load it
            if (!$("link[href='https://assets.documentcloud.org/note_embed/note_embed-datauri.css']").length &&
                !$("link[href='https://assets.documentcloud.org/note_embed/note_embed.css']").length) {
                /*@cc_on
                /*@if (@_jscript_version < 5.8)
                    loadCSS('https://assets.documentcloud.org/note_embed/note_embed.css');
                @else @*/
                    loadCSS('https://assets.documentcloud.org/note_embed/note_embed-datauri.css');
                /*@end
                @*/
            }
            if (window.dc && window.dc.embed) {
                    // Clear out existing note to force redraw
                    if (window.dc.embed.notes[dc_note_id]) {
                        delete window.dc.embed.notes[dc_note_id];
                    }
                    dc.embed.loadNote(note_url, {'container': container});
            }
            else {
                // Load note_embed script
                $.getScript('https://assets.documentcloud.org/note_embed/note_embed.js').done(function () {
                    $(function () {
                        dc.embed.loadNote(note_url, {'container': container});
                    });
                });
            }
        // jQuery is not on the page
        } else {
            console.error('Could not load note, jQuery is not on the page.');
        }
    }

    return {
        embedNote : embedNote
    }
}());
