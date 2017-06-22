#!/usr/bin/env python

"""
Project-wide application configuration.

DO NOT STORE SECRETS, PASSWORDS, ETC. IN THIS FILE.
They will be exposed to users. Use environment variables instead.
See get_secrets() below for a fast way to access them.
"""

"""
NAMES
"""
# Project name used for display
PROJECT_NAME = 'Document Viewer'

# Project name in urls
# Use dashes, not underscores!
PROJECT_SLUG = 'documents'

# The name of the repository containing the source
REPOSITORY_NAME = 'papertrail'
REPOSITORY_URL = 'git@github.com:nprapps/%s.git' % REPOSITORY_NAME
REPOSITORY_ALT_URL = None # 'git@bitbucket.org:nprapps/%s.git' % REPOSITORY_NAME'

# The name to be used in paths on the server
PROJECT_FILENAME = 'papertrail'

"""
DEPLOYMENT
"""
FILE_SERVER = '10.36.2.26'
S3_BUCKET = 'apps.npr.org'
DEFAULT_MAX_AGE = 20

# These variables will be set at runtime. See configure_targets() below
DEBUG = True

"""
COPY EDITING
"""
COPY_GOOGLE_DOC_KEY = '1pogl4JaaIkEcXvPu2zDbTo_I4uLNSEm0vB8WxnNPBuU'

"""
SHARING
"""
PROJECT_DESCRIPTION = ''
SHARE_URL = 'http://%s/%s/' % (S3_BUCKET, PROJECT_SLUG)

TWITTER = {
    'TEXT': PROJECT_NAME,
    'URL': SHARE_URL,
    # Will be resized to 120x120, can't be larger than 1MB
    'IMAGE_URL': ''
}

FACEBOOK = {
    'TITLE': PROJECT_NAME,
    'URL': SHARE_URL,
    'DESCRIPTION': PROJECT_DESCRIPTION,
    # Should be square. No documented restrictions on size
    'IMAGE_URL': TWITTER['IMAGE_URL'],
    'APP_ID': '138837436154588'
}

GOOGLE = {
    # Thumbnail image for Google News / Search.
    # No documented restrictions on resolution or size
    'IMAGE_URL': TWITTER['IMAGE_URL']
}
"""
SERVICES
"""
GOOGLE_ANALYTICS_ID = 'UA-5828686-4'
