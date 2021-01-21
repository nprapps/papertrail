var nprdc = (function () {
    function embedNote(url, container) {
        if (typeof $ !== "undefined" && typeof $.getScript === "function") {
            // Extract note_id and slug from url

            var re = /https:\/\/beta.documentcloud.org\/documents\/(.*?)#document\/p(\d+)\/a(\d+)/;
            var match = re.exec(url);

            var oldRe = /https:\/\/www.documentcloud.org\/documents\/(.*?)\.html#.*\/a(\d+)/;
            var oldMatch = oldRe.exec(url);

            // Compose the note javascript url
            var note_url;
            if (match) {
                //https://embed.documentcloud.org/documents/20438922-general-order/annotations/2010483.js
                dc_slug = match[1];
                dc_note_id = match[3];
                dc_pnum = match[2];
                note_url =
                    "https://embed.documentcloud.org/documents/" +
                    dc_slug +
                    "/annotations/" +
                    dc_note_id +
                    ".js";
            } else if (oldMatch) {
                dc_slug = oldMatch[1];
                dc_note_id = oldMatch[2];

                note_url =
                    "https://www.documentcloud.org/documents/" +
                    dc_slug +
                    "/annotations/" +
                    dc_note_id +
                    ".js";
            }

            // Simulate DocumentCloud loader script
            var loadCSS = function (url, media) {
                var link = document.createElement("link");
                link.rel = "stylesheet";
                link.type = "text/css";
                link.media = media || "screen";
                link.href = url;
                var head = document.getElementsByTagName("head")[0];
                head.appendChild(link);
            };

            //Check if we have the CSS in place if not load it
            if (
                !$(
                    "link[href='https://assets.documentcloud.org/note_embed/note_embed-datauri.css']"
                ).length &&
                !$(
                    "link[href='https://assets.documentcloud.org/note_embed/note_embed.css']"
                ).length
            ) {
                /*@cc_on
                /*@if (@_jscript_version < 5.8)
                    loadCSS('https://assets.documentcloud.org/note_embed/note_embed.css');
                @else @*/
                loadCSS(
                    "https://assets.documentcloud.org/note_embed/note_embed-datauri.css"
                );
                /*@end
                @*/
            }
            if (window.dc && window.dc.embed) {
                // Clear out existing note to force redraw

                if (window.dc.embed.notes[dc_note_id]) {
                    delete window.dc.embed.notes[dc_note_id];
                }
                dc.embed.loadNote(note_url, { container: container });
            } else {
                // Load note_embed script
                if (match) {
                    $('#DC-note-example').attr('id', 'DC-note-' + dc_note_id);
                    $.getScript(
                        "https://beta.documentcloud.org/notes/loader.js"
                    ).done(function () {
                        $(function () {
                            dc.embed.loadNote(note_url, {
                                container: container,
                            });
                        });
                    });
                } else {
                    $.getScript(
                        "https://assets.documentcloud.org/note_embed/note_embed.js"
                    ).done(function () {
                        $(function () {
                            dc.embed.loadNote(note_url, {
                                container: container,
                            });
                        });
                    });
                }
            }
            // jQuery is not on the page
        } else {
            console.error("Could not load note, jQuery is not on the page.");
        }
    }

    return {
        embedNote: embedNote,
    };
})();
