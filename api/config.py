import os
import string

FILEBEAT_HOST = os.environ.get("FILEBEAT_HOST")
FILEBEAT_PORT = os.environ.get("FILEBEAT_PORT")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
DB_NAME = os.environ.get("DB_NAME")
JWT_SECRET = os.environ.get("JWT_SECRET")
LOGIN_SERVER = os.environ.get("LOGIN_SERVER")
ROLE_GESTOR = os.environ.get("ROLE_GESTOR")
ROLE_CONSULTOR = os.environ.get("ROLE_CONSULTOR")
ROLE_VALIDADOR = os.environ.get("ROLE_VALIDADOR")
ROLE_ADMIN = os.environ.get("ROLE_ADMIN")
CHARSET_SECRETS = string.ascii_letters + string.digits
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
RAND_NUMBER_CODE = int(os.environ.get("RAND_NUMBER_CODE"))
BUSINESS_TYPES = [
    { "businessType": "Tecnologia" },
    { "businessType": "Gestion humana" },
    { "businessType": "Legales" },
    { "businessType": "Otro" }
]
FORMAT_DATE_ACCESS = "%d/%m/%Y"
CARD_IMAGE = "/api/resources/images/card.png"
NONE_PERSON_IMAGE = "/api/resources/images/person.png"
FONT_PATH = os.environ.get("FONT_PATH")
FONT_SIZE = int(os.environ.get("FONT_SIZE"))
WIDTH_CARD = 317 #px
HEIGHT_CARD = 402 #px
BORDER_SEPARATOR_WIDTH = 2 #px
POS_Y_SEPARATOR_LINE = 201 #px
MAX_WIDTH_PERSON = 72 #px
MAX_HEIGHT_PERSON = 77 #px
POS_X_PERSON = 238 #px
POS_Y_PERSON = 110 #px
POS_X_TITLE = 140 #px
POS_Y_TITLE = 30 #px
POS_X_BODY = 20 #px
POS_Y_BODY = 110 #px
SIZE_QRCODE = 190 #px
POS_X_QRCODE = 58 #px
POS_Y_QRCODE = 205 #px
MARGIN_BREAK_LINE = 20 #px
MAX_QR_CODE_SIZE = 51200 # 1MB
MAX_QR_CODE_SCAN_HEIGHT = 500 #px
MAX_QR_CODE_SCAN_WIDTH = 500 #px