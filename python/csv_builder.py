import gspread, csv, datetime, shutil
from datetime import timedelta, date

#create backup file
yesterdays_string = r"../data/backup/gis_contacts_"
yesterday = date.today() - timedelta(1)
yesterdays_sheet = yesterdays_string + str(yesterday) + ".csv"
shutil.copyfile(r"../data/gis_contacts.csv",yesterdays_sheet)

#pass credentials to google docs
gc = gspread.login('chandlersterling1@gmail.com','mhtqwlguwhpxcrux')

#open sheet by key
sht1 = gc.open_by_key('0AgDW4THnpFhkdExhY1hmeXpGc25CYXlOenRGVzZ6YUE')

#open worksheet
worksheet = sht1.sheet1

#get all values
list_of_lists = worksheet.get_all_values()

#open csv file for writing
contact_sheet = open(r"../data/gis_contacts.csv","wb")

#instantiate csv writer for contact sheet
writer = csv.writer(contact_sheet,delimiter=',',quotechar='"',quoting=csv.QUOTE_ALL)

#loop through list of lists and output each line to csv
for row in list_of_lists:

	try:
		#output to csv
		writer.writerow(row)
	except:
		#chances are, the writer will fail if the cell value type is unicode
		#identify which cell is coming through as unicode and fix it
		#unicode type tends to be cast when there are extra spaces trailing a cell's value
		for i in row:
			print i, type(i)

contact_sheet.close()

