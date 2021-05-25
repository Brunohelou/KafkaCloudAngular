const express = require('express') // express to manage server config aplication, helps with API definition too
const app = express()
let http = require('http').Server(app) ; //declare http with http properties
const mongoose = require('mongoose'); //lib to easly define schemas and etc for mongodb
const { Kafka } = require('kafkajs'); //lib used to use kafka with javascript
let io = require('socket.io')(http); //lib used to define socket server
const port = 3000 //port where the server will run over

const uri = "your url" //this is the uri to connect with Atlas DB



const sorocabaWeather = new mongoose.Schema({ // schema of the database for sorocaba datas
  temp:       Number,
	temp_max:   Number,
	temp_min:   Number,
	wind_speed: Number,
	humidity:   Number,
  time:       Date,
});
const Sorocaba = mongoose.model('Kitten', sorocabaWeather); //create a model named sorocaba with will subscribe model named kitten to sorocabaweather schema


mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}); //connect mongodb


const db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});






let value;


io.on('connection', (socket)=>{ //create socket connection
  console.log("USER CONNECTED"); //if user connect, return USER CONNECTED to CONSOLE
  socket.emit('message', this.value); //Send this.value to 'message' socket connection
  socket.on('disconnect', function(){ 
    console.log("USER DISCONNECTED"); //when user disconnect print USER DISCONNECTED to CONSOLE
  });

});
const kafka = new Kafka({ //define a kafka object with brokers 9092,9093,9094
    clientId: 'my-app',
    brokers: ['localhost:9092','localhost:9093','localhost:9094']
  })

  http.listen(8091, () => { //create comunication with port 8091 (where app will fetch for socket info)
    const consumer = kafka.consumer({ groupId: 'test-group' }) //create kafka consumer to group test-group (irrelevant for this application)

    consumer.connect() // connect consumer to brokers
    consumer.subscribe({ topic: 'Soro', fromBeginning: true}) //subscribe consumer to topic Soro from broker's leader
    

    consumer.run({
    eachMessage: async ({ topic, partition, message }) => { //run the consumer
     /* console.log({
        value: message.value.toString(),
      });*/

      io.emit('message', message.value.toString()); //send the message value to the socket 'message' 
      this.value = message.value.toString();  //get var value with the values as a string
      let weatherData =JSON.parse(message.value); //parse data to JSON
      let date  = new Date(message.timestamp); //gets timestamp for database purposes
      const data = new Sorocaba({    //instance object data from type Sorocaba model and initiate it
        temp: parseFloat(weatherData.main.temp),
        temp_max: parseFloat(weatherData.main.temp_max),
        temp_min: parseFloat(weatherData.main.temp_min),
        wind_speed: parseFloat(weatherData.wind.speed),
        humidity: parseFloat(weatherData.main.humidity),
        time: date,
        });
      data.save(function(err, data){ //save data to server at Atlas
        if(err) return console.error(err);
        console.log('saved',data);
      })
      console.log('emited', message.value.toString());
    },
  });
  
      

});

/*const consumer2 = kafka.consumer({ groupId: 'test-group' })

consumer2.connect();
consumer2.subscribe({topic: 'Soro', fromBeginning:true});

consumer2.run({
  eachMessage: async ({topic, partition, message}) => {

  }
})*/









app.get('/chartdata',async function(req, res) { // API to fetch all weather data at Atlas DB
  
  const data = await Sorocaba.find();
  res.send(data);


});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`) //initiate sever at port #default 3000 
  //###OBS###
  // When deploy the server, be sure that localhost is replaced with an acessible url and open port
})