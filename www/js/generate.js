$('.example').click(function() {
    $('input[name="doc-url"]').val($(this).attr('href'));

    $('#generate').click();

    return false;
});

$('#generate').click(function() {
    var url = $('input[name="doc-url"]').val();

    var re = /https:\/\/(beta||www).documentcloud.org\/documents\/.*/;

    if (url == '') {
        alert('Please paste in a DocumentCloud URL.');
        return;
    }

    var bits = url.split('/');
    var slug = bits[bits.length - 1];
    slug = slug.substring(0, slug.length - 5);

    if (bits.length < 2 || !slug) {
        alert('This not does appear to be a valid DocumentCloud URL.');
        return;
    }

    fullscreen_url = 'https://' + APP_CONFIG.S3_BUCKET + '/' + APP_CONFIG.PROJECT_SLUG + '/document.html?id=' + slug;
    embed_url = 'https://' + APP_CONFIG.S3_BUCKET + '/' + APP_CONFIG.PROJECT_SLUG + '/document.html?embed=true&id=' + slug;

    embed_url = 'http://localhost:8000/document.html?embed=true&id=' + slug;
    var iframe = JST.embed({ url: embed_url });

    $('input[name="fullscreen-url"]').val(fullscreen_url);
    $('textarea[name="embed-code"]').val(iframe);

    $('.results').show();

    $('#iframe-example').html(iframe);
});

