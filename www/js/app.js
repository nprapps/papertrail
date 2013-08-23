function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

$(function() { 
    var slug = getParameterByName('doc');

    DV.load('//www.documentcloud.org/documents/' + slug 
+ '.js', {
        //width: 300,
        //height: 300,
        container: '#DV-viewer'
    });
   
});
