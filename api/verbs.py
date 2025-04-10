from flask import jsonify
from config import ROLE_ADMIN, ROLE_CONSULTOR, ROLE_GESTOR, ROLE_VALIDADOR
from flask_pydantic import validate
from app import app
from controller import *
from schemas import GetAccessSchema, PostAccessSchema, PutAccessSchema, PostQrCodeSchema, GetBusinessTypeQueryParam, PostBusinessTypeSchema, GetAccessForDatatablesSchema
from exceptions import CouldntDecodeQR, InvalidJWTQR, AccessCedulaAlreadyExists
from decorators import token_required
from sqlalchemy.exc import IntegrityError
import sys

@app.route('/', methods=['GET', 'POST'])
def index():
    return jsonify({"API": "API Provider Access", "version": "1.0", "message": "successful"}), 200

@app.route('/businessTypes', methods=['GET'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR, ROLE_CONSULTOR)
def get_businessTypes(query : GetBusinessTypeQueryParam):
    try:
        businessTypes = BusinessTypesController().getBusinessTypes(query)
        return jsonify({"message": "success", "businessTypes": businessTypes }), 200
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/businessTypes', methods=['POST'])
@validate()
@token_required(ROLE_ADMIN)
def create_businessType(body : PostBusinessTypeSchema):
    try:
        businessType = BusinessTypesController().newBusinessType(body)
        return jsonify({"message": "success", "businessType": businessType }), 201
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/businessTypes/<id>', methods=['PUT'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR)
def update_businessTypes(id : int, body : PostBusinessTypeSchema):
    try:
        businessType = BusinessTypesController().updateBusinessType(id, body)
        return jsonify({"message": "success", "businessType": businessType }), 200
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/businessTypes/<id>', methods=['DELETE'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR)
def delete_businessTypes(id : int):
    try:
        businessType = BusinessTypesController().deleteBusinessType(id)
        return jsonify({"message": "success", "businessType": businessType }), 200
    except BusinessTypeInUse:
        return jsonify({"message": "error", "reason":"Business type in use"}), 400
    except Exception as e:
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/access/forTable', methods=['POST'])
@validate()
@token_required(ROLE_ADMIN)
def get_access(body : GetAccessSchema):
    try:
        ( access, paging ) = AccessController().getAccess(body)
        return jsonify({"message": "success", "access": access, "paging": paging }), 200
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/access/<cedula>', methods=['GET'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR, ROLE_CONSULTOR)
def get_access_cedula(cedula : int):
    try:
        access = AccessController().getAccessByCedula(cedula)
        return jsonify({"message": "success", "access": access }), 200
    except AccessNotFound:
        return jsonify({"message": "error", "reason":"Access not found"}), 404
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route("/access/forDataTables", methods=['POST'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR, ROLE_CONSULTOR)
def get_access_forDataTables(body: GetAccessForDatatablesSchema):
    try:
        resp = AccessController().getAccessForDataTables(body)
        print(resp, file=sys.stderr)
        return jsonify(resp)
    except DataTableColumnsExceedsLength:
        return jsonify({"message": "error", "reason":"Bad request, columns exceeds length"}), 400
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route("/access/columns/forDataTables", methods=['GET'])
@token_required(ROLE_ADMIN, ROLE_GESTOR, ROLE_CONSULTOR)
def get_access_columns():
    try:
        columns = AccessController().getColumnsForDataTables()
        return jsonify({"message": "success", "columns": columns }), 200
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/access', methods=['POST'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR)
def create_access(body : PostAccessSchema):
    try:
        access = AccessController().newAccess(body)
        return jsonify({"message": "success", "access": access }), 201
    except AccessCedulaAlreadyExists as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Ya existe un acceso para esa cedula"}), 400
    except IntegrityError as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"El businessType otorgado no es valido"}), 400
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/access/<cedula>', methods=['PUT'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR)
def update_access(cedula : int, body : PutAccessSchema):
    try:
        access = AccessController().updateAccess(cedula, body)
        return jsonify({"message": "success", "access": access }), 200
    except IntegrityError as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"El businessType otorgado no es valido"}), 400
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/access/isValid/<cedula>/<code>', methods=['GET'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR, ROLE_CONSULTOR, ROLE_VALIDADOR)
def is_valid_access(cedula : int, code: str):
    try:
        access = AccessController().isValid(cedula, code)
        return jsonify({"message": "success", "isValid": True, "access": access }), 200
    except AccessNotFound:
        return jsonify({"message": "error", "reason":"Access not found"}), 404
    except AccessNotActive:
        return jsonify({"message": "error", "reason":"Access not active"}), 400
    except AccessOutOfDate:
        return jsonify({"message": "error", "reason":"Access out of date"}), 400
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/access/<cedula>/card', methods=['GET'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR, ROLE_CONSULTOR)
def get_access_card(cedula : int):
    try:
        accessCard = AccessController().getAccessCard(cedula)
        return jsonify({"message": "success", "accessCard": accessCard }), 200
    except AccessNotFound:
        return jsonify({"message": "error", "reason":"Access not found"}), 404
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched"}), 500

@app.route('/access/qrcode', methods=['POST'])
@validate()
@token_required(ROLE_ADMIN, ROLE_GESTOR, ROLE_CONSULTOR, ROLE_VALIDADOR)
def validate_qrcode(body : PostQrCodeSchema):
    try:
        access = AccessController().isValidQRCode(body.qrCode)
        return jsonify({"message": "success", "access": access, "isValid": True}), 200
    except CouldntDecodeQR:
        return jsonify({"message": "error", "reason":"QR Invalid", "isValid": False}), 400
    except InvalidJWTQR:
        return jsonify({"message": "error", "reason":"Invalid JWT", "isValid": False}), 400
    except AccessNotFound:
        return jsonify({"message": "error", "reason":"Access not found", "isValid": False}), 404
    except AccessNotActive:
        return jsonify({"message": "error", "reason":"Access not active", "isValid": False}), 400
    except AccessOutOfDate:
        return jsonify({"message": "error", "reason":"Access out of date", "isValid": False}), 400
    except Exception as e:
        print(str(e), file=sys.stderr)
        return jsonify({"message": "error", "reason":"Last instance exception uncatched", "isValid": False}), 500