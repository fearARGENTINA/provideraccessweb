from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import  SQLALCHEMY_DATABASE_URL, \
                    FILEBEAT_HOST, \
                    FILEBEAT_PORT
import logging
import ecs_logging
from handlers import PlainTextTcpHandler

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URL

db = SQLAlchemy(app)

from verbs import *

socket_handler = PlainTextTcpHandler(FILEBEAT_HOST, FILEBEAT_PORT)
socket_handler.setLevel(logging.INFO)
socket_handler.setFormatter(ecs_logging.StdlibFormatter())
app.logger.addHandler(socket_handler)
app.logger.setLevel(logging.INFO)    