$('#generate').click(function() {
    var url = $('input[name="doc-url"]').val();
    var bits = url.split('/');
    var slug = bits[bits.length - 1];
    slug = slug.substring(0, slug.length - 5);

    url = APP_CONFIG.S3_BASE_URL + '/?embed=true&doc=' + slug;

    var iframe = JST.embed({ url: url });

    $('textarea[name="embed-code"]').val(iframe);
});

