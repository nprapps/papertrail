$('#generate').click(function() {
    var url = $('input[name="doc-url"]').val();

    if (url == '') {
        alert('Please paste in a DocumentCloud URL.');
        return;
    }

    var bits = url.split('/');
    var slug = bits[bits.length - 1];
    slug = slug.substring(0, slug.length - 5);

    if (bits.length < 2 || !slug) {
        alert('This does appear to be a valid DocumentCloud URL.');
        return;
    }

    fullscreen_url = APP_CONFIG.S3_BASE_URL + '/document.html?id=' + slug;
    embed_url = APP_CONFIG.S3_BASE_URL + '/document.html?embed=true&id=' + slug;

    var iframe = JST.embed({ url: embed_url });

    $('input[name="fullscreen-url"]').val(fullscreen_url);
    $('textarea[name="embed-code"]').val(iframe);

    $('.results').show();

    $('#iframe-example').html(iframe);
});

