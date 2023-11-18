class Config(object):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///mad-II project.db'
    SECRET_KEY = "thisissecter"
    SECURITY_PASSWORD_SALT = "thisissaltt"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    # SECURITY_LOGOUT_METHODS = None

class DevelopmentConfig(Config):
    DEBUG = True
