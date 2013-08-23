var embed = null;
var viewer = null;

function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function onDocumentLoad() {
    var title = viewer.api.getTitle();
    var related_url = viewer.api.getRelatedArticle();

    $('header h1').text(title);
    $('title').text(title + ' - Document Viewer : NPR');

    if (related_url && !embed) {
        $('header h2 a').text(viewer.api.getiRelatedArticle());
        $('header h2').show();
    }
}

$(function() { 
    var slug = getParameterByName('doc');
    embed = getParameterByName('embed') == 'true' ? true : false;
    var width = null;
    var height = null;
    var sidebar = true;

    if (embed) {
        width = '100%';
        height = 300; 
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
