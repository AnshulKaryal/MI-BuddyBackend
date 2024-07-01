import express from "express";
import mongoConnect from './Db/conn.js';
import 'dotenv/config'
import morgan from "morgan";
import * as ServerStatus from './Middleware/helper.js'
import userRoute from './Router/UserRoute.js'
import partnerRoute from './Router/PartnerRoute.js'

const app = express();

const port = process.env.PORT || 8080;

app.use(express.json());

app.use(morgan('tiny'))
app.disable('x-powered-by') //less hackers know about our stack

// HTTP GET Request
app.get('/', ServerStatus.getServerLoadInfo , (req, res) => {
    const uptime =  ServerStatus.calculateUptime();
    const serverLoadInfo = req.serverLoadInfo;
    res.status(201).send({
        success: true,
        message: 'MI Buddy Backend!',
        dateTime: new Date().toLocaleString(),
        connectedClient: process.env.CLIENT_BASE_URL,
        systemStatus:{
            uptime: `${uptime}s`,
            cpuLoad: serverLoadInfo.cpuLoad,
            memoryUsage: serverLoadInfo.memoryUsage,
        }
    })
})

// api routes
app.use('/api', userRoute)
app.use('/api', partnerRoute)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// start server only when we have valid connection
mongoConnect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to  http://localhost:${port}`)
        })
    } catch (error) {
        console.log("Can\'t connect to the server");
    }
})
.catch((err) => {
    console.log("MongoDB connnection failed !!!",err);
})