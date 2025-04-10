from logging import handlers
import sys

class PlainTextTcpHandler(handlers.SocketHandler):
    """ Sends plain text log message over TCP channel """
    def __init__(self, *args, **kwargs):                                        
        super(PlainTextTcpHandler, self).__init__(*args, **kwargs)        
        self._retry_count = 0   

    def handleError(self, record):
        super(PlainTextTcpHandler, self).handleError(record)
        
        if self._retry_count >= 10:                                                      
            return           
                                                           
        self._retry_count = self._retry_count + 1
        try:                                                                    
            self.emit(record)                                           
        finally:                                                                
            self._is_retry = 0

    def makePickle(self, record):
        message = self.formatter.format(record) + "\r\n"
        return message.encode()