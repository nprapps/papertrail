#!/usr/bin/env python

from glob import glob
import os

from fabric.api import *

import app
import app_config

"""
Template-specific functions

Changing the template functions should produce output
with fab render without any exceptions. Any file used
by the site templates should be rendered by fab render.
"""
def less():
    """
    Render LESS files to CSS.
    """
    for path in glob('less/*.less'):
        filename = os.path.split(path)[-1]
        name = os.path.splitext(filename)[0]
        out_path = 'www/css/%s.less.css' % name

        local('node_modules/less/bin/lessc %s %s' % (path, out_path))

def jst():
    """
    Render Underscore templates to a JST package.
    """
    local('node_modules/universal-jst/bin/jst.js --template underscore jst www/js/templates.js')

def download_copy():
    """
    Downloads a Google Doc as an .xls file.
    """
    base_url = 'https://docs.google.com/spreadsheets/d/%s/pub?output=xls'
    doc_url = base_url % app_config.COPY_GOOGLE_DOC_KEY
    local('curl -o data/copy.xls "%s"' % doc_url)

def update_copy():
    """
    Fetches the latest Google Doc and updates local JSON.
    """
    download_copy()

def app_config_js():
    """
    Render app_config.js to file.
    """
    from app import _app_config_js

    response = _app_config_js()
    js = response[0]

    with open('www/js/app_config.js', 'w') as f:
        f.write(js)

def copy_js():
    """
    Render copy.js to file.
    """
    from app import _copy_js

    response = _copy_js()
    js = response[0]

    with open('www/js/copy.js', 'w') as f:
        f.write(js)

def render():
    """
    Render HTML templates and compile assets.
    """
    from flask import g

    update_copy()
    less()
    jst()

    app_config_js()
    copy_js()

    compiled_includes = []

    for rule in app.app.url_map.iter_rules():
        rule_string = rule.rule
        name = rule.endpoint

        if name == 'static' or name.startswith('_'):
            print 'Skipping %s' % name
            continue

        if rule_string.endswith('/'):
            filename = 'www' + rule_string + 'index.html'
        elif rule_string.endswith('.html'):
            filename = 'www' + rule_string
        else:
            print 'Skipping %s' % name
            continue

        dirname = os.path.dirname(filename)

        if not (os.path.exists(dirname)):
            os.makedirs(dirname)

        print 'Rendering %s' % (filename)

        with app.app.test_request_context(path=rule_string):
            g.compile_includes = True
            g.compiled_includes = compiled_includes

            view = app.__dict__[name]
            content = view()

            compiled_includes = g.compiled_includes

        with open(filename, 'w') as f:
            f.write(content.encode('utf-8'))

def tests():
    """
    Run Python unit tests.
    """
    local('nosetests')

"""
Deployment

Changes to deployment requires a full-stack test. Deployment
has two primary functions: Pushing flat files to S3 and deploying
code to a remote server if required.
"""
def deploy_to_file_server(path='www'):
    local('rm -rf %s/live-data' % path)
    local('rm -rf %s/sitemap.xml' % path)

    local('rsync -vr %s/ tools-admin@%s:~/www/%s' % (path, app_config.FILE_SERVER, app_config.PROJECT_SLUG))


def deploy_nprdc_to_s3():
    """
    Deploy test script to s3
    """
    source_path = 'www/js/nprdc.js'
    remote_path = 'js/nprdc.js'
    s3cmd = 's3cmd -P --add-header=Cache-Control:max-age=5 --guess-mime-type put %s %s'
    local(s3cmd % (source_path, 's3://%s/%s/%s' % (app_config.S3_BUCKET, app_config.PROJECT_SLUG, remote_path)))



def _deploy_to_s3(path='.gzip'):
    """
    Deploy the gzipped stuff to S3.
    """
    # Clear files that should never be deployed
    local('rm -rf %s/live-data' % path)
    local('rm -rf %s/sitemap.xml' % path)

    s3cmd = 's3cmd -P --add-header=Cache-Control:max-age=5 --guess-mime-type --recursive --exclude-from gzip_types.txt sync %s/ %s'
    s3cmd_gzip = 's3cmd -P --add-header=Cache-Control:max-age=5 --add-header=Content-encoding:gzip --guess-mime-type --recursive --exclude "*" --include-from gzip_types.txt sync %s/ %s'

    local(s3cmd % (path, 's3://%s/%s/' % (app_config.S3_BUCKET, app_config.PROJECT_SLUG)))
    local(s3cmd_gzip % (path, 's3://%s/%s/' % (app_config.S3_BUCKET, app_config.PROJECT_SLUG)))

    # HACK: Don't allow index.html on public site
    local('s3cmd del s3://%s/%s/index.html' % (app_config.S3_BUCKET, app_config.PROJECT_SLUG))
    # HACK: Don't allow notes/index.html on public site
    local('s3cmd del s3://%s/%s/notes/index.html' % (app_config.S3_BUCKET, app_config.PROJECT_SLUG))

def _gzip(in_path='www', out_path='.gzip'):
    """
    Gzips everything in www and puts it all in gzip
    """
    local('python gzip_assets.py %s %s' % (in_path, out_path))

def deploy(remote='origin'):
    """
    Deploy the latest app to S3 and, if configured, to our servers.
    """
    render()
    deploy_to_file_server('www')
    _gzip('www', '.gzip')
    _deploy_to_s3('.gzip')


"""
Destruction

Changes to destruction require setup/deploy to a test host in order to test.
Destruction should remove all files related to the project from both a remote
host and S3.
"""
def _confirm(message):
    answer = prompt(message, default="Not at all")

    if answer.lower() not in ('y', 'yes', 'buzz off', 'screw you'):
        exit()

def shiva_the_destroyer():
    """
    Deletes the app from s3
    """
    _confirm("You are about to destroy everything deployed to %s for this project.\nDo you know what you're doing?" % app_config.DEPLOYMENT_TARGET)

    with settings(warn_only=True):
        s3cmd = 's3cmd del --recursive %s'

        local(s3cmd % ('s3://%s/%s' % (app_config.S3_BUCKET, app_config.PROJECT_SLUG)))

    # TODO: not update for file_server
