from flask import request, g
import math
from schemas import GetBusinessTypeQueryParam
from exceptions import AccessNotFound, AccessNotActive, AccessOutOfDate, CouldntDecodeQR, InvalidJWTQR, BusinessTypeNotFound, BusinessTypeInUse, DataTableColumnsExceedsLength, AccessCedulaAlreadyExists
from models import Access, BusinessTypes
from helpers import *
from app import app, db
from config import RAND_NUMBER_CODE, FORMAT_DATE_ACCESS, CARD_IMAGE, NONE_PERSON_IMAGE, MAX_WIDTH_PERSON, MAX_HEIGHT_PERSON, POS_X_PERSON, POS_Y_PERSON, POS_X_TITLE, POS_Y_TITLE, POS_X_BODY, POS_Y_BODY, MARGIN_BREAK_LINE, FONT_PATH, CHARSET_SECRETS, FONT_SIZE, JWT_SECRET, SIZE_QRCODE, POS_X_QRCODE, POS_Y_QRCODE, HEIGHT_CARD, WIDTH_CARD, POS_Y_SEPARATOR_LINE, BORDER_SEPARATOR_WIDTH, MAX_QR_CODE_SCAN_HEIGHT, MAX_QR_CODE_SCAN_WIDTH
import secrets
from PIL import Image, ImageFont, ImageDraw
import base64
import io
from datetime import datetime, timedelta
import jwt
import json
import qrcode
from pyzbar.pyzbar import decode
import sys
from sqlalchemy import String, desc, asc, or_, and_, cast, func

class ImageProcessor:
    def resize(self, pilImage, maxWidth=None, maxHeight=None):
        newWidth = None
        newHeight = None
        if pilImage.width >= pilImage.height:
            newWidth = maxWidth
            wpercent = (newWidth / float(pilImage.width))
            newHeight = int(float(pilImage.height)*float(wpercent))
        else:
            newHeight = maxHeight
            wpercent = (newHeight / float(pilImage.height))
            newWidth = int(float(pilImage.width)*float(wpercent))

        return pilImage.resize((newWidth, newHeight), Image.ANTIALIAS)

class BusinessTypesController:
    def getBusinessTypes(self, query):
        q = BusinessTypes.query

        if not query.id is None:
            q = q.filter_by(id=query.id)

        if not query.businessType is None:
            q = q.filter_by(businessType=query.businessType)

        q = q.order_by(asc("id"))
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "GET_BUSINESS_TYPES",
            "event.original": json.dumps(query.dict()),
            "event.outcome": "success"
        })

        return [businessType.serialize() for businessType in q.all()]

    def newBusinessType(self, body):
        businessType = BusinessTypes(
            businessType=body.businessType
        )
        
        db.session.add(businessType)
        db.session.commit()
        db.session.refresh(businessType)

        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. New business type", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. New business type",
            "event.action": "CREATE_BUSINESS_TYPE",
            "event.original": json.dumps(body.dict()),
            "event.reference": str(businessType.id),
            "event.outcome": "success"
        })

        return businessType.serialize()

    def updateBusinessType(self, id, body):
        businessType = BusinessTypes.query.filter_by(id=id).first()
        
        if businessType is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Business type not found", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Business type not found",
                "event.action": "UPDATE_BUSINESS_TYPE",
                "event.original": json.dumps(body.dict()),
                "event.reference": str(body.id),
                "event.reason": "Business type not found",
                "event.outcome": "failed"
            })
            raise BusinessTypeNotFound

        businessType.businessType = body.businessType
        
        db.session.add(businessType)
        db.session.commit()
        db.session.refresh(businessType)
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Update business type", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Update business type",
            "event.action": "UPDATE_BUSINESS_TYPE",
            "event.original": json.dumps(body.dict()),
            "event.reference": str(id),
            "event.outcome": "success"
        })

        return businessType.serialize()

    def deleteBusinessType(self, id):
        if not Access.query.filter_by(businessType=id).first() is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Business type in use", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Business type in use",
                "event.action": "DELETE_BUSINESS_TYPE",
                "event.reference": str(id),
                "event.reason": "Business type in use",
                "event.outcome": "failed"
            })
            raise BusinessTypeInUse

        businessType = BusinessTypes.query.filter_by(id=id).first()
        businessTypeObj = businessType.serialize()

        db.session.delete(businessType)
        db.session.commit()
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Delete business type", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Delete business type",
            "event.action": "DELETE_BUSINESS_TYPE",
            "event.original": json.dumps(businessTypeObj),
            "event.reference": str(id),
            "event.outcome": "success"
        })

        return True

class AccessController:
    def getColumnsForDataTables(self):
        columns = Access.__table__.columns.keys()
        columns.remove("_userPhoto")
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Get columns for DataTables", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Get columns for DataTables",
            "event.action": "GET_COLUMNS_DATATABLES",
            "event.outcome": "success"
        })

        return columns
    
    def getAccessByCedula(self, cedula):
        access = Access.query.filter_by(cedula=cedula).first()

        if access is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}. Access not found", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}. Access not found",
                "event.action": "GET_ACCESS_BY_CEDULA",
                "event.reason": "Access not found",
                "event.reference": str(cedula),
                "event.outcome": "failed"
            })
            raise AccessNotFound
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "GET_ACCESS_BY_CEDULA",
            "event.reference": str(cedula),
            "event.outcome": "success"
        })

        return access.serialize()
    
    def getAccess(self, query):
        q = Access.query

        if not query.cedula is None:
            q = q.filter(cast(Access.cedula, String).ilike(f"%{query.cedula}%"))

        if not query.name is None:
            q = q.filter(Access.name.ilike(f"%{query.name}%"))

        if not query.lastName is None:
            q = q.filter(Access.lastName.ilike(f"%{query.lastName}%"))

        if not query.businessName is None:
            q = q.filter(Access.businessName.ilike(f"%{query.businessName}%"))

        if not query.businessRUT is None:
            q = q.filter(cast(Access.businessRUT, String).ilike(f"%{query.businessRUT}%"))

        if not query.businessType is None:
            q = q.filter_by(businessType=query.businessType)
        
        if not query.isActive is None:
            q = q.filter_by(isActive=query.isActive)
            
        if not query.dateStart is None:
            if not query.dateStart.start is None:
                q = q.filter(
                    func.to_date(Access.dateStart, "DD/MM/YYYY") >= query.dateStart.start
                )
            if not query.dateStart.end is None:
                q = q.filter(
                    func.to_date(Access.dateStart, "DD/MM/YYYY") <= query.dateStart.end
                )

        if not query.dateEnd is None:
            if query.dateEnd.undefined:
               q = q.filter(Access.dateEnd == None) 
            else :
                if not query.dateEnd.start is None:
                    q = q.filter(
                        or_(
                            Access.dateEnd == None,
                            func.to_date(Access.dateEnd, "DD/MM/YYYY") >= query.dateEnd.start
                        )
                    )
                if not query.dateEnd.end is None:
                    q = q.filter(
                        and_(
                            Access.dateEnd != None,
                            func.to_date(Access.dateEnd, "DD/MM/YYYY") <= query.dateEnd.end
                        )
                    )

        if not query.search is None:
            conditionFilterGeneralList = []
            for col in Access.__table__.columns.keys():
                conditionFilterGeneralList += [cast(getattr(Access, col), String).ilike(f'%{query.search}%')]
            
            if len(conditionFilterGeneralList):
                conditionSearchValue = or_(*conditionFilterGeneralList)
                q = q.filter(conditionSearchValue)

        total = q.count()
        
        if not query.skip is None:
            q = q.offset(query.skip)

        if not query.limit is None:
            q = q.limit(query.limit)
                
        pagesCount = math.ceil(total / query.limit)
        actualPage = min(math.floor((query.skip / query.limit) + 1), pagesCount)
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "GET_ACCESS",
            "event.original": json.dumps(query.dict()),
            "event.outcome": "success"
        })

        return ([
            { 
                key: val for key, val in access.serialize().items() if key != "code"
            } for access in q.all()
        ], {
            "total": total,
            "page": actualPage,
            "pages": pagesCount
            }
        )

    def getAccessForDataTables(self, body):
        columnsNames = self.getColumnsForDataTables()

        draw = body.draw
        start = body.start
        length = 10 if body.length is None else body.length
        orderByColumnIdx = 0 if body.order[0].column is None else body.order[0].column
        orderBy = columnsNames[orderByColumnIdx]
        sortOrder = "asc" if body.order is None else body.order[0].dir

        columnsData = [] if body.columns is None else body.columns
        
        if len(columnsData) > len(columnsNames):
            raise DataTableColumnsExceedsLength

        searchValue = "" if body.search is None else body.search.value
        #searchRegex = False if body.search is None else body.search.get("regex", False)
        
        q = Access.query

        if not orderBy is None:
            if sortOrder == "asc":
                q = q.order_by(asc(orderBy))
            elif sortOrder == "desc":
                q = q.order_by(desc(orderBy))    

        totalRows = q.count()
        totalRowsWithFilter = totalRows
        if len(searchValue):
            conditionFilterGeneralList = []
            for col in columnsNames:
                conditionFilterGeneralList += [cast(getattr(Access, col), String).ilike(f'%{searchValue}%')]
            
            if len(conditionFilterGeneralList):
                conditionSearchValue = or_(*conditionFilterGeneralList)
                q = q.filter(conditionSearchValue)
                totalRowsWithFilter = q.count()

        conditionFilterColumnList = []
        for i, column in enumerate(columnsData):
            value = column.search.value

            if len(value):
                conditionFilterColumnList += [cast(getattr(Access, columnsNames[i]), String).ilike(f'%{value}%')]
        
        if len(conditionFilterColumnList):
            conditionSearchValue = and_(*conditionFilterColumnList)
            q = q.filter(conditionSearchValue)
            totalRowsWithFilter = q.count()

        q = q.offset(start)
        if length:
            q = q.limit(length)
        _lAccess = q.all()
    
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "GET_ACCESS_FOR_DATATABLES",
            "event.original": json.dumps(body.dict()),
            "event.outcome": "success"
        })

        _accessDataTables = [
            [
                getattr(_access, c) for c in columnsNames
            ] for _access in _lAccess
        ]

        return {
            "draw": draw,
            "recordsTotal": totalRows,
            "recordsFiltered": totalRowsWithFilter,
            "data": _accessDataTables
        }

    def generateCode(self, length: int = 8):
        return "".join(secrets.choice(CHARSET_SECRETS) for _ in range(length))

    def newAccess(self, body):
        if not Access.query.filter_by(cedula=body.cedula).first() is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "NEW_ACCESS",
                "event.reason": "Access already exists",
                "event.original": json.dumps(body.dict()),
                "event.outcome": "failed"
            })
            raise AccessCedulaAlreadyExists

        code = self.generateCode(RAND_NUMBER_CODE)
        
        userPhoto = b""
        if not body.userPhoto is None and len(body.userPhoto):
            userPhotoImage = Image.open(io.BytesIO(base64.b64decode(body.userPhoto)))
            
            if userPhotoImage.width >= userPhotoImage.height:
                newWidth = MAX_WIDTH_PERSON
                wpercent = (newWidth / float(userPhotoImage.width))
                newHeight = int(float(userPhotoImage.height)*float(wpercent))
            else:
                newHeight = MAX_HEIGHT_PERSON
                wpercent = (newHeight / float(userPhotoImage.height))
                newWidth = int(float(userPhotoImage.width)*float(wpercent))

            userPhotoImage = userPhotoImage.resize((newWidth, newHeight), Image.ANTIALIAS)

            buffered = io.BytesIO()
            userPhotoImage.save(buffered, format="PNG")
            userPhoto = base64.b64encode(buffered.getvalue()).decode('utf-8')

        access = Access(
            cedula=body.cedula,
            code=code,
            dateStart=body.dateStart,
            dateEnd=body.dateEnd,
            name=body.name,
            lastName=body.lastName,
            userPhoto=userPhoto,
            businessName=body.businessName,
            businessRUT=body.businessRUT,
            businessEmail=body.businessEmail,
            businessContact=body.businessContact,
            businessType=body.businessType
        )

        db.session.add(access)
        db.session.commit()
        db.session.refresh(access)

        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "NEW_ACCESS",
            "event.original": json.dumps(body.dict()),
            "event.reference": str(body.cedula),
            "event.outcome": "success"
        })

        return access.serialize()

    def updateAccess(self, cedula, body):
        access = Access.query.filter_by(cedula=cedula).first()
        
        if access is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "UPDATE_ACCESS",
                "event.reason": "Access not found",
                "event.original": json.dumps(body.dict()),
                "event.reference": str(cedula),
                "event.outcome": "failed"
            })
            raise AccessNotFound

        access.dateStart = body.dateStart
        access.dateEnd = body.dateEnd
        access.name = body.name
        access.lastName = body.lastName
        access.userPhoto = body.userPhoto
        access.businessName = body.businessName
        access.businessRUT = body.businessRUT
        access.businessEmail = body.businessEmail
        access.businessContact = body.businessContact
        access.businessType = body.businessType
        if not body.isActive is None:
            access.isActive = body.isActive
        
        db.session.add(access)
        db.session.commit()
        db.session.refresh(access)
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "UPDATE_ACCESS",
            "event.original": json.dumps(body.dict()),
            "event.reference": str(cedula),
            "event.outcome": "success"
        })

        return access.serialize()
    
    def isValid(self, cedula, code):
        access = Access.query.filter_by(cedula=cedula, code=code).first()
        
        if access is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "IS_VALID",
                "event.reason": "Access not found",
                "event.original": json.dumps({"cedula": cedula, "code": code}),
                "event.reference": str(cedula),
                "event.outcome": "failed"
            })
            raise AccessNotFound
        
        if not access.isActive:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "IS_VALID",
                "event.reason": "Access not active",
                "event.original": json.dumps({"cedula": cedula, "code": code}),
                "event.reference": str(cedula),
                "event.outcome": "failed"
            })
            raise AccessNotActive

        todayDate = datetime.now()
        dateStart = datetime.strptime(access.dateStart, FORMAT_DATE_ACCESS)
        dateEnd = None if access.dateEnd is None else (datetime.strptime(access.dateEnd, FORMAT_DATE_ACCESS) + timedelta(hours=24) - timedelta(microseconds=1))

        if dateStart > todayDate:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "IS_VALID",
                "event.reason": "Access out of date",
                "event.original": json.dumps({"cedula": cedula, "code": code}),
                "event.reference": str(cedula),
                "event.outcome": "failed"
            })
            raise AccessOutOfDate

        if not dateEnd is None and dateEnd < todayDate:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "IS_VALID",
                "event.reason": "Access out of date",
                "event.original": json.dumps({"cedula": cedula, "code": code}),
                "event.reference": str(cedula),
                "event.outcome": "failed"
            })
            raise AccessOutOfDate

        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "IS_VALID",
            "event.original": json.dumps({"cedula": cedula, "code": code}),
            "event.reference": str(cedula),
            "event.outcome": "success"
        })

        return access.serialize()
    
    def getAccessCard(self, cedula):
        access = Access.query.filter_by(cedula=cedula).first()
        
        if access is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "GET_ACCESS_CARD",
                "event.reason": "Access not found",
                "event.reference": str(cedula),
                "event.outcome": "failed"
            })
            raise AccessNotFound

        backgroundImage = Image.new('RGB', (WIDTH_CARD, HEIGHT_CARD), (255,255,255))
        
        cardImage = Image.open(CARD_IMAGE)
        if access.userPhoto is None or not len(access.userPhoto):
            personImage = Image.open(NONE_PERSON_IMAGE)
        else:
            personImage = Image.open(io.BytesIO(base64.b64decode(access.userPhoto)))
        
        if personImage.width >= personImage.height:
            newWidth = MAX_WIDTH_PERSON
            wpercent = (newWidth / float(personImage.width))
            newHeight = int(float(personImage.height)*float(wpercent))
        else:
            newHeight = MAX_HEIGHT_PERSON
            wpercent = (newHeight / float(personImage.height))
            newWidth = int(float(personImage.width)*float(wpercent))

        personImage = personImage.resize((newWidth, newHeight), Image.ANTIALIAS)

        outCardImage = backgroundImage.copy()
        outCardImage.paste(cardImage, (0, 0))
        outCardImage.paste(personImage, (POS_X_PERSON, POS_Y_PERSON))

        font = ImageFont.truetype(FONT_PATH, FONT_SIZE)        
        drawOutCardImage = ImageDraw.Draw(outCardImage)
        
        titleTexts = ["PROVEEDOR EXTERNO", access.businessName]
        for i, titleText in enumerate(titleTexts):
            drawOutCardImage.text((POS_X_TITLE, POS_Y_TITLE+(font.getsize(titleText)[1]+(MARGIN_BREAK_LINE)*(i))), titleText, (255,255,255), font=font)
        
        businessType = BusinessTypesController().getBusinessTypes(GetBusinessTypeQueryParam(id=access.businessType))[0]["businessType"]

        bodyTexts = [f"{access.name.capitalize()} {access.lastName.capitalize()}", f"C.I.: {access.cedula}", f"({businessType})", f"{access.code}"]
        for i, bodyText in enumerate(bodyTexts):
            drawOutCardImage.text((POS_X_BODY, POS_Y_BODY+(font.getsize(bodyText)[1]+(MARGIN_BREAK_LINE*(i)))), bodyText, (0,0,0), font=font)

        curX = 0
        for x in range(curX, outCardImage.width, 4):
            drawOutCardImage.line([(x, POS_Y_SEPARATOR_LINE), (x + 2, POS_Y_SEPARATOR_LINE)], fill=(170, 170, 170), width=BORDER_SEPARATOR_WIDTH)

        jwtToken = self.generateJWT(access.cedula, access.code)

        qr = qrcode.QRCode(version=1, box_size=10, border=0)
        qr.add_data(jwtToken)
        qr.make(fit=True)
        qrImage = qr.make_image()
        qrImage = qrImage.resize((SIZE_QRCODE, SIZE_QRCODE), Image.ANTIALIAS)

        outCardImage.paste(qrImage, (POS_X_QRCODE, POS_Y_QRCODE))

        buffered = io.BytesIO()
        outCardImage.save(buffered, format="PNG")
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "GET_ACCESS_CARD",
            "event.reference": str(cedula),
            "event.outcome": "success"
        })

        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    def generateJWT(self, cedula, code):
        return jwt.encode({"cedula": cedula, "code": code}, JWT_SECRET, algorithm="HS256")
    
    def getDataQRCode(self, qrCodeb64):
        qrCodeImage = Image.open(io.BytesIO(base64.b64decode(qrCodeb64)))

        if qrCodeImage.width > MAX_QR_CODE_SCAN_WIDTH or qrCodeImage.height > MAX_QR_CODE_SCAN_HEIGHT:
            qrCodeImage = ImageProcessor().resize(qrCodeImage, MAX_QR_CODE_SCAN_WIDTH, MAX_QR_CODE_SCAN_HEIGHT)

        decodeQR = decode(qrCodeImage)

        if not len(decodeQR) or decodeQR is None:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "IS_VALID_QR",
                "event.reason": "Coudnt decode QR",
                "event.outcome": "failed"
            })
            raise CouldntDecodeQR

        token = decodeQR[0].data.decode('ascii')

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms="HS256")
        except Exception as e:
            print(e, file=sys.stderr)
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "IS_VALID_QR",
                "event.reason": "Invalid JWT in QR Code",
                "event.outcome": "failed"
            })
            raise InvalidJWTQR

        if not "cedula" in data or not "code" in data:
            app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
                "client.ip": request.remote_addr,
                "user.name": g.user,
                "user.roles": g.roles,
                "http.request.method": request.method,
                "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
                "event.action": "IS_VALID_QR",
                "event.reason": "Invalid JWT in QR Code",
                "event.outcome": "failed"
            })
            raise InvalidJWTQR

        return data

    def isValidQRCode(self, qrCodeb64):
        data = self.getDataQRCode(qrCodeb64)
        
        app.logger.info(f"{request.method} {request.path} from {request.remote_addr}.", extra={
            "client.ip": request.remote_addr,
            "user.name": g.user,
            "user.roles": g.roles,
            "http.request.method": request.method,
            "http.request.body.content": f"{request.method} {request.path} from {request.remote_addr}.",
            "event.action": "IS_VALID_QR",
            "event.original": json.dumps({"cedula": data["cedula"], "code": data["code"]}),
            "event.reference": data["cedula"],
            "event.outcome": "success"
        })

        return self.isValid(data["cedula"], data["code"])