var slug = null;
var embed = null;
var viewer = null;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Via: http://stackoverflow.com/a/1912522
function htmlDecode(input) {
    var e = document.createElement("div");
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function onDocumentLoad(result) {
    if (result) {
        var title = result.title;
        var page_title = title + " - Document Viewer : NPR";
        var related_url = result.related_article;
        $("header h1").text(title);
        document.title = page_title;
    }
    var fullscreen_url =
        "https://" +
        APP_CONFIG.S3_BUCKET +
        "/" +
        APP_CONFIG.PROJECT_SLUG +
        "/document.html?id=" +
        slug;

    if (embed || !result) {
        $("header").remove();
    }

    if (related_url && !embed) {
        $("header h2 a").attr({ href: related_url });
        $("header h2").show();
    }

    $("#fullscreen-link a").attr({ href: fullscreen_url });

    var context = $.extend(APP_CONFIG, {
        url: fullscreen_url,
        text: title ? "Document: " + title : "DocumentCloud Document",
        title: page_title || "",
    });

    $(".social-links").html(JST.share(context));
}

function setupGoogleAnalytics() {
    var _gaq = _gaq || [];
    _gaq.push(["_setAccount", APP_CONFIG.GOOGLE_ANALYTICS_ID]);
    _gaq.push(["_trackPageview"]);
    (function () {
        var ga = document.createElement("script");
        ga.type = "text/javascript";
        ga.async = true;
        ga.src =
            ("https:" == document.location.protocol
                ? "https://ssl"
                : "http://www") + ".google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);
    })();
}

function setupChartbeat() {
    var _sf_async_config = {};
    /** CONFIGURATION START **/
    _sf_async_config.uid = 18888;
    _sf_async_config.domain = "npr.org";
    /** CONFIGURATION END **/
    (function () {
        function loadChartbeat() {
            window._sf_endpt = new Date().getTime();
            var e = document.createElement("script");
            e.setAttribute("language", "javascript");
            e.setAttribute("type", "text/javascript");
            e.setAttribute(
                "src",
                ("https:" == document.location.protocol
                    ? "https://a248.e.akamai.net/chartbeat.download.akamai.com/102508/"
                    : "http://static.chartbeat.com/") + "js/chartbeat.js"
            );
            document.body.appendChild(e);
        }
        var oldonload = window.onload;
        window.onload =
            typeof window.onload != "function"
                ? loadChartbeat
                : function () {
                      oldonload();
                      loadChartbeat();
                  };
    })();
}

$(function () {
    slug = getParameterByName("id");

    var re = /.+(\d+)/;
    var match = re.exec(slug);

    embed = getParameterByName("embed") == "true" ? true : false;
    var width = null;
    var height = null;
    var sidebar = true;

    if (embed) {
        width = "100%";
        height = 450;
        sidebar = false;
        $("body").addClass("embed");
    } else {
        $("body").addClass("fullscreen");

        setupGoogleAnalytics();
        setupChartbeat();
    }

    if (window.innerWidth <= 480) {
        sidebar = false;
    }

    var src = "https://embed.documentcloud.org/documents/" + slug + "/?title=1";
    console.log(src)
    if (sidebar) src += "&sidebar=1";
    if (embed) src += "&embed=1";
    $("#document").attr("src", src);

    $.get("https://api.beta.documentcloud.org/api/documents/" + match[0])
        .success(function (data) {
            onDocumentLoad(data);
        })
        .error(function (data) {
            onDocumentLoad(null);
        });
});
