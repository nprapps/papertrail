var nprdc = (function () {
    function embedNote(url, container) {
        if (typeof $ !== "undefined" && typeof $.getScript === "function") {
            // Extract note_id and slug from url
            var re = /https:\/\/beta.documentcloud.org\/documents\/(.*?)#document\/p(\d+)\/a(\d+)/;
            var match = re.exec(url);

            var oldRe = /https:\/\/www.documentcloud.org\/documents\/(.*?)\.html#.*\/a(\d+)/;
            var oldMatch = oldRe.exec(url);

            // Compose the note javascript url
            if (match) {
                dc_slug = match[1];
                dc_note_id = match[3];
                dc_pnum = match[2];
            } else if (oldMatch) {
                dc_slug = oldMatch[1];
                dc_note_id = oldMatch[2];
            }
            var note_url =
                "https://www.documentcloud.org/documents/" +
                dc_slug +
                "/annotations/" +
                dc_note_id +
                ".js";

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
            $(".DC-embed-label").attr("for", "DC-note-example");
                $(".DC-embed.DC-embed-note").attr("id", "DC-note-example");

            if (
                !match &&
                window.dc &&
                window.dc.embed &&
                window.dc.embed.notes
            ) {
                // Clear out existing note to force redraw
                if (window.dc.embed.notes[dc_note_id]) {
                    delete window.dc.embed.notes[dc_note_id];
                }
                dc.embed.loadNote(note_url, { container: container });
            } else if (match) {
                if (window.dc && window.dc.embed && window.dc.embed.notes) {
                    delete window.dc;
                }
                $(".DC-embed-label").attr("for", "DC-note-" + dc_note_id);
                $(".DC-embed.DC-embed-note").attr(
                    "id",
                    "DC-note-" + dc_note_id
                );
                $(".DC-embed.DC-embed-note").removeClass("DC-embed-enhanced");
                if (window.dc && window.dc.embed) {
                    dc.embed.loadNote(note_url);
                } else {
                    $.getScript(
                        "https://beta.documentcloud.org/notes/loader.js"
                    ).done(function () {
                        $(function () {
                            console.log(note_url)
                            dc.embed.loadNote(note_url);
                        });
                    });
                }
            } else {
                if (window.dc && window.dc.embed) {
                    delete window.dc;
                }
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
            // jQuery is not on the page
        } else {
            console.error("Could not load note, jQuery is not on the page.");
        }
    }

    return {
        embedNote: embedNote,
    };
})();
