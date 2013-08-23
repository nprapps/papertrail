var viewer = null;

function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function onDocumentLoad() {
    $('header h1').text(viewer.api.getTitle());
    $('header h2').text(viewer.api.getDescription());
}

$(function() { 
    var slug = getParameterByName('doc');
    var embed = getParameterByName('embed') == 'true' ? true : false;
    var width = null;
    var height = null;
    var sidebar = true;

    if (embed) {
        width = '100%';
        height = 300; 
        sidebar = false;
    } else if (window.innerWidth <= 420) {
        docsidebar = false;
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
