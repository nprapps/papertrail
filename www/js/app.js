var slug = null;
var embed = null;
var viewer = null;

function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Via: http://stackoverflow.com/a/1912522
function htmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function onDocumentLoad() {
    var title = htmlDecode(viewer.api.getTitle());
    var page_title = title + ' - Document Viewer : NPR';
    var related_url = viewer.api.getRelatedArticle();
    var fullscreen_url = APP_CONFIG.S3_BASE_URL + '/document.html?id=' + slug;

    $('header h1').text(title);

    if (related_url && !embed) {
        $('header h2 a').attr({ href: viewer.api.getRelatedArticle() });
        $('header h2').show();
    }

    $('#fullscreen-link a').attr({ href: fullscreen_url });

    var context = $.extend(APP_CONFIG, {
        url: fullscreen_url,
        text: 'Document: ' + title,
        title: page_title
    });

    $('.social-links').html(JST.share(context));
    
    document.title = page_title;
}

$(function() { 
    slug = getParameterByName('id');
    embed = getParameterByName('embed') == 'true' ? true : false;
    var width = null;
    var height = null;
    var sidebar = true;

    if (embed) {
        width = '100%';
        height = 450; 
        sidebar = false;
        $('body').addClass('embed');
    } else {
        $('body').addClass('fullscreen');
    }

    if (window.innerWidth <= 480) {
        sidebar = false;
    }

    viewer = DV.load('//www.documentcloud.org/documents/' + slug 
+ '.js', {
        width: width,
        height: height,
        sidebar: sidebar,
        container: '#DV-viewer',
        afterLoad: onDocumentLoad 
    });
});
