#!/usr/bin/env python
# _*_ coding:utf-8 _*_
from glob import glob
import os
from distutils.util import strtobool
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

    base_url = 'https://docs.google.com/spreadsheets/export?format=xlsx&id=%s'
    doc_url = base_url % app_config.COPY_GOOGLE_DOC_KEY
    local('curl -L -o data/copy.xlsx "%s"' % doc_url)


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


def prep_bool_arg(arg):
    return bool(strtobool(str(arg)))


def deploy_to_file_server(path, server, slug):
    local('rsync -vr %s/ visadmin@%s:~/www/%s' % (path,
                                                     server,
                                                     slug))


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
    # Clear files that should never be deployed
    local('rm -rf %s/live-data' % 'www')
    local('rm -rf %s/sitemap.xml' % 'www')

    deploy_to_file_server('www', app_config.FILE_SERVER, app_config.PROJECT_SLUG)
    _gzip('www', '.gzip')
    # Sync gzip files
    awscli_sync('.gzip', True, False, app_config.S3_BUCKET, app_config.PROJECT_SLUG)
    # Sync other files
    awscli_sync('www', False, False, app_config.S3_BUCKET, app_config.PROJECT_SLUG)

    # HACK: Don't allow index.html on public site
    local('aws s3 rm s3://%s/%s/index.html' % (app_config.S3_BUCKET,
                                               app_config.PROJECT_SLUG))
    # HACK: Don't allow notes/index.html on public site
    local('aws s3 rm s3://%s/%s/notes/index.html' % (app_config.S3_BUCKET,
                                                     app_config.PROJECT_SLUG))

def deploy_staging(remote='origin'):
    """
    Deploy the latest app to S3 and, if configured, to our servers.
    """
    app_config.PROJECT_SLUG = app_config.PROJECT_SLUG_STAGING
    app_config.S3_BUCKET = app_config.S3_BUCKET_STAGING

    render()

    # Clear files that should never be deployed
    local('rm -rf %s/live-data' % 'www')
    local('rm -rf %s/sitemap.xml' % 'www')

    deploy_to_file_server('www', app_config.FILE_SERVER, app_config.PROJECT_SLUG_STAGING)
    _gzip('www', '.gzip')
    # Sync gzip files
    awscli_sync('.gzip', True, False, app_config.S3_BUCKET_STAGING, app_config.PROJECT_SLUG_STAGING)
    # Sync other files
    awscli_sync('www', False, False, app_config.S3_BUCKET_STAGING, app_config.PROJECT_SLUG_STAGING)

    # HACK: Don't allow index.html on public site
    local('aws s3 rm s3://%s/%s/index.html' % (app_config.S3_BUCKET_STAGING,
                                               app_config.PROJECT_SLUG_STAGING))
    # HACK: Don't allow notes/index.html on public site
    local('aws s3 rm s3://%s/%s/notes/index.html' % (app_config.S3_BUCKET_STAGING,
                                                     app_config.PROJECT_SLUG_STAGING))

def awscli_sync(path, gzip, dryrun, bucket, slug):
    """
    sync folder to s3 bucket
    """
    gzip = prep_bool_arg(gzip)
    dryrun = prep_bool_arg(dryrun)
    GZIP_FILE_TYPES = ['*.html', '*.js', '*.json', '*.css', '*.xml']
    command = 'aws s3 sync %s s3://%s/%s --acl="public-read"' % (
        path,
        bucket,
        slug)
    # add cache control header
    command += ' --cache-control "max-age=%i"' % (app_config.DEFAULT_MAX_AGE)
    if dryrun:
        command += ' --dryrun'

    # add include exclude options and content-encoding
    if gzip:
        command += ' --content-encoding "gzip" --exclude="*"'
        arg = '--include'
    else:
        command += ' --exclude=".*"'
        arg = '--exclude'
    for ext in GZIP_FILE_TYPES:
        command += ' %s="%s"' % (arg, ext)
    local(command)


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


def shiva_the_destroyer(dryrun=False):
    """
    Deletes the app from s3
    """
    dryrun = prep_bool_arg(dryrun)
    _confirm("You are about to destroy everything deployed to %s for this project.\nDo you know what you're doing?" % app_config.S3_BUCKET)

    command = 'aws s3 rm --recursive s3://%s/%s' % (
        app_config.S3_BUCKET,
        app_config.PROJECT_SLUG)

    if dryrun:
        command += ' --dryrun'

    with settings(warn_only=True):
        local(command)

    # TODO: not update for file_server
