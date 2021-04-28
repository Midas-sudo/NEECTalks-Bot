import csv
import sys

output = []
result = []
users = []
counter = 0
for i in range(31):
    output.append([])

with open(sys.argv[1], 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        if row:
            row = row[0].split()
            if row[0] == 'ID':
                day = row[2].split('/')
                day = day[0]
            else:
                output[int(day)-1].append(row)

    for i in range(31):
        counter = 0
        if output[i]:
            for j in range(len(output[i])):
                if output[i][j][1] == '0':
                    users.clear()
                    users.append(output[i][j][0])
                    counter += 1
                else:
                    if output[i][j][0] not in users:
                        counter += 1
                        users.append(output[i][j][0])
        result.append(str(counter))
        users.clear()
    # print(result)
file = sys.argv[1]
file = file + '_result.csv'
with open(file, mode='w') as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow([sys.argv[1]])
    for i in range(31):
        writer.writerow([str(i) + ',' + result[i]])
