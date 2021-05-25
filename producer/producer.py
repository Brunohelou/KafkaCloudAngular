from datetime import datetime
from pykafka import KafkaClient 
import requests
import json
import time


########### INSTRUCTIONS TO RUN THE CODE ####################
#At the terminal, simpy paste python producer.py
#to stop, hit ctrl+C on terminal console

############ DESCRIPTION ####################################
#this is a producer destined to inform a kafka topic with the data taken from OPEN WEATHER API city 3447399 (Sorocaba-SP BR)
#the topic for this aplication is meant to be created over zookeeper server localhost:'2181', wich contains the subscribed hosts presented at client
#the purpose is feed a server with a consumer and a database to keep track of weather data and provide useful information for the application in Angular (description on the server project)



#Get data of Sorocaba weather  and parse to JSON
def getData():
    r = requests.get('openurl') 
    #Obs: this API updates every 10 minutes. In order to see te producer working faster, and amplify our sample, recomends setting the call every 1-5 minutes
    city_info = r.json()
    client = KafkaClient(hosts='localhost:9092,localhost:9093,localhost:9094') #define client as a KafkaClient subscribed to localhosts:9092, 9093. 9094
    topic = client.topics['Soro'] #subcribe to topic 'Soro' at the hosts
    producer = topic.get_sync_producer() #define producer and sync with topic
    #print(city_info) // this is a print for debug the city_info data
    producer.produce(json.dumps(city_info).encode('ascii'), city_info['name'].encode('ascii')) #produce the data to the topic, with the json data from city info as ASCII and city name as key
    time.sleep(300) # wait in seconds (#default 300 = 5mins)


while True: #keep the script roling
    getData()

