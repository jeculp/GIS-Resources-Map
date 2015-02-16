import gspread, csv

#pass credentials to google docs
gc = gspread.login('chandlersterling1@gmail.com','mhtqwlguwhpxcrux')

#open sheet by key
sht1 = gc.open_by_key('0AgDW4THnpFhkdExhY1hmeXpGc25CYXlOenRGVzZ6YUE')

#open worksheet
worksheet = sht1.sheet1

#get all values
list_of_lists = worksheet.get_all_values()

#open csv file for writing
contact_sheet = open("gis_contacts.csv","wb")

#instantiate csv writer for contact sheet
writer = csv.writer(contact_sheet,delimiter=',',quotechar="'",quoting=csv.QUOTE_ALL)

#loop through list of lists and output each line to csv
x = 0
wtf = []
for row in list_of_lists:

	#output to csv
	writer.writerow(row)
	#if x < 1:
	#	print row
	#	x += 1


contact_sheet.close()
#print wtf

