from config import MAX_QR_CODE_SIZE
from exceptions import FileNotValidImage, NotValidImageExtension, ImageSizeExceeded
import base64
from PIL import Image
import io
import sys
class ImageValidator:
    def isb64ValidImage(self, base64String):
        try:
            image = base64.b64decode(base64String)
            img = Image.open(io.BytesIO(image))
        except Exception:
            raise FileNotValidImage

        if len(img.fp.read()) / 1024 >  MAX_QR_CODE_SIZE:
            raise ImageSizeExceeded

        if not img.format.lower() in ["jpg", "jpeg", "png"]:
            raise NotValidImageExtension
