import urllib3
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)
from app import app, db
from models import BusinessTypes
from config import BUSINESS_TYPES

def createDefaultBusinessTypes():
    if not BusinessTypes.query.first() is None:
        return

    businessTypes = [
        BusinessTypes(**BUSINESS_TYPE)
        for BUSINESS_TYPE in BUSINESS_TYPES
    ]

    for businessType in businessTypes:
        db.session.add(businessType)
        db.session.commit()
        db.session.refresh(businessType)

if __name__ == '__main__':
    db.create_all()
    createDefaultBusinessTypes()
    app.run(host='0.0.0.0', port=5444, debug=True)