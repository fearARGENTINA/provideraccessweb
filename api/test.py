import names
from datetime import datetime, date, timedelta
from random import randrange

def random_date(start, end):
    """
    This function will return a random datetime between two datetime 
    objects.
    """
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    return start + timedelta(seconds=random_second)

def getRandomAccess():
    businessPostfix = ['S.A.', 'S.R.L.', 'Inc.', 'Brothers', 'Company', 'Building']
    cdr = ['com', 'com.uy', 'uy', 'com.ar', 'net']
    firstName = names.get_first_name()
    lastName = names.get_last_name()
    businessContact = f"{firstName} {lastName}"
    businessName = f"{names.get_last_name()} {businessPostfix[randrange(0, len(businessPostfix))]}"
    businessEmail = f"{firstName.lower()}.{lastName.lower()}@{businessName.split()[0].lower()}.{cdr[randrange(0, len(cdr))]}"
    cedula = randrange(1000000, 95000000)
    businessType = randrange(7, 13)
    businessRUT = randrange(100000000000, 999999999999)
    dateStart = random_date(date(2000, 1, 1), date(2022,8,10)).strftime("%d/%m/%Y")
    dateEnd = [None, random_date(datetime.strptime(dateStart, "%d/%m/%Y").date(), date(2022,8,10)).strftime("%d/%m/%Y")][randrange(0,2)]
    return {"name": firstName, "lastName": lastName, "businessContact": businessContact, "businessRUT": businessRUT, "businessName": businessName, "businessEmail": businessEmail, "cedula": cedula, "businessType": businessType, "dateStart": dateStart, "dateEnd": dateEnd}