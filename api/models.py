import base64
from app import db
from sqlalchemy.dialects.postgresql import BYTEA

class BusinessTypes(db.Model):
    __tablename__ = "businesstypes"
    id = db.Column(db.Integer, primary_key=True)
    businessType = db.Column(db.String)

    def __init__(self, businessType):
        self.businessType = businessType
    
    def serialize(self):
        return {
            "id": self.id,
            "businessType": self.businessType
        }

class Access(db.Model):
    __tablename__ = "access"
    cedula = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, default=None)
    dateStart = db.Column(db.String)
    dateEnd = db.Column(db.String, default=None)
    name = db.Column(db.String, default="")
    lastName = db.Column(db.String, default="")
    _userPhoto = db.Column(BYTEA, default="")
    businessName = db.Column(db.String, default="")
    businessRUT = db.Column(db.BigInteger, default=None)
    businessEmail = db.Column(db.String, default="")
    businessContact = db.Column(db.String, default="")
    businessType = db.Column(db.Integer, db.ForeignKey("businesstypes.id"))
    isActive = db.Column(db.Boolean, default=True)

    def __init__(self, cedula, code, dateStart, dateEnd, name, lastName, businessName, businessRUT, businessEmail, businessContact, businessType, userPhoto=None):
        self.cedula = cedula
        self.code = code
        self.dateStart = dateStart
        self.dateEnd = dateEnd
        self.name = name
        self.lastName = lastName
        self.userPhoto = userPhoto
        self.businessName = businessName
        self.businessRUT = businessRUT
        self.businessEmail = businessEmail
        self.businessContact = businessContact
        self.businessType = businessType

    @property
    def userPhoto(self):
        if self._userPhoto is None or not len(self._userPhoto):
            return None

        return base64.b64encode(self._userPhoto).decode('utf-8')

    @userPhoto.setter
    def userPhoto(self, value):
        self._userPhoto = base64.b64decode(value)

    def serialize(self):
        return {
            "cedula": self.cedula,
            "code": self.code,
            "dateStart": self.dateStart,
            "dateEnd": self.dateEnd,
            "name": self.name,
            "lastName": self.lastName,
            "userPhoto": self.userPhoto,
            "businessName": self.businessName,
            "businessRUT": self.businessRUT,
            "businessEmail": self.businessEmail,
            "businessContact": self.businessContact,
            "businessType": self.businessType,
            "isActive": self.isActive
        }