input_start_date=2021-4-1
input_end_date=2021-6-25

startDate=$(date -I -d "$input_start_date") || exit -1
endDate=$(date -I -d "$input_end_date") || exit -1

d="$startDate"

while [[ "$d" < "$endDate" ]]; do

  value=$(date +%Y%m%d -d "$d")
  echo "Pulling games for $value"
  command="node index.js $value"
  eval $command
  d=$(date -I -d "$d + 1 day")
done


