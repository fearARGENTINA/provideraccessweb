class AccessNotFound(Exception):
    pass

class AccessCedulaAlreadyExists(Exception):
    pass

class AccessNotActive(Exception):
    pass

class AccessOutOfDate(Exception):
    pass

class FileNotValidImage(Exception):
    pass

class ImageSizeExceeded(Exception):
    pass

class NotValidImageExtension(Exception):
    pass

class CouldntDecodeQR(Exception):
    pass

class InvalidJWTQR(Exception):
    pass

class BusinessTypeNotFound(Exception):
    pass

class BusinessTypeInUse(Exception):
    pass

class DataTableColumnsExceedsLength(Exception):
    pass