from multiprocessing.sharedctypes import Value
import sys
from pydantic import BaseModel, Field, PositiveInt, validator, StrictStr, StrictInt, StrictBool, EmailStr
from typing import List, Literal, Optional
from datetime import date, datetime
from exceptions import NotValidImageExtension, FileNotValidImage, ImageSizeExceeded
from config import FORMAT_DATE_ACCESS
from helpers import ImageValidator

class OrderGetAccessForDatatablesSchema(BaseModel):
    column: StrictInt
    dir: Literal["asc", "desc"]

class SearchGetAccessForDatatablesSchema(BaseModel):
    value: StrictStr
    regex: StrictBool

class ColumnsGetAccessForDatatablesSchema(BaseModel):
    data: StrictInt
    name: StrictStr
    searchable: StrictBool
    orderable: StrictBool
    search: SearchGetAccessForDatatablesSchema

    def serialize(self):
        return {
            "data": self.data,
            "name": self.name,
            "searchable": self.searchable,
            "orderable": self.orderable,
            "search": {
                "value": self.search.value,
                "regex": self.search.regex
            }
        }

class GetAccessForDatatablesSchema(BaseModel):
    draw: StrictInt
    start: StrictInt
    length: StrictInt
    order: List[OrderGetAccessForDatatablesSchema]
    columns: List[ColumnsGetAccessForDatatablesSchema]
    search: SearchGetAccessForDatatablesSchema

class GetBusinessTypeQueryParam(BaseModel):
    id: Optional[int]
    businessType: Optional[str]

class PostBusinessTypeSchema(BaseModel):
    businessType: StrictStr    

class PostQrCodeSchema(BaseModel):
    qrCode: StrictStr
    @validator("qrCode", pre=False)
    @classmethod
    def parse_qrCode(cls, v):
        try:
            ImageValidator().isb64ValidImage(v)
        except FileNotValidImage:
            raise ValueError("Imagen no valida")
        except ImageSizeExceeded:
            raise ValueError("La imagen pesa mas de 1MB")
        except NotValidImageExtension:
            raise ValueError("Extension de archivo de userPhoto no valida")
        except Exception as e:
            raise ValueError(e)
        return v

class RangeDate(BaseModel):
    start: Optional[date]
    end: Optional[date]

class RangeDateInfinite(RangeDate):
    undefined: Optional[bool]

class GetAccessSchema(BaseModel):
    isActive: Optional[bool]
    cedula: Optional[int]
    code: Optional[str]
    name: Optional[str]
    lastName: Optional[str]
    businessName: Optional[str]
    businessRUT: Optional[int]
    businessType: Optional[int]
    isActive: Optional[bool]
    dateStart: Optional[RangeDate]
    dateEnd: Optional[RangeDateInfinite]
    limit: Optional[PositiveInt] = 100
    skip: Optional[int] = Field(0, ge=0)
    search: Optional[str]

class PutAccessSchema(BaseModel):
    dateStart: StrictStr
    dateEnd: Optional[str]
    name: StrictStr
    lastName: StrictStr
    userPhoto: Optional[str]
    businessName: StrictStr
    businessRUT: StrictInt
    businessEmail: EmailStr
    businessContact: StrictStr
    businessType: StrictInt
    isActive: Optional[bool]
    @validator("name", "lastName", pre=False)
    @classmethod
    def lowercase_names(cls, v):
        return v.lower()
    @validator("dateStart", pre=False)
    @classmethod
    def parse_dateStart(cls, v):
        try:
            _ = datetime.strptime(v, FORMAT_DATE_ACCESS)
        except Exception:
            raise ValueError(f"Valor dateStart no valido. Formato: {FORMAT_DATE_ACCESS} - Ejemplo: 10/01/2022")
        return v
    @validator("dateEnd", pre=True)
    @classmethod
    def parse_dateEnd(cls, v):
        if v is None:
            return None
        try:
            _ = datetime.strptime(v, FORMAT_DATE_ACCESS)
        except Exception:
            raise ValueError(f"Valor dateEnd no valido. Formato: {FORMAT_DATE_ACCESS} - Ejemplo: 10/01/2022")
        return v
    @validator("userPhoto", pre=False)
    @classmethod
    def parse_userPhoto(cls, v):
        if v is None:
            return ""
        try:
            ImageValidator().isb64ValidImage(v)
        except FileNotValidImage:
            raise ValueError("Imagen no valida")
        except NotValidImageExtension:
            raise ValueError("Extension de archivo de userPhoto no valida")
        except Exception:
            raise ValueError("Error")
        return v
    @validator("businessRUT", pre=True)
    @classmethod
    def must_be_valid_businessRUT(cls, v):
        if not len(str(v)) <= 12:
            raise ValueError(f"Valor de businessRUT no valido. Debe ser un numero de 12 digitos")
        return v

class PostAccessSchema(PutAccessSchema):
    cedula: StrictInt