import http from "http"

import config from "./constants/config.js";
import app from "./app.js";


const port = config.PORT || 3000

const server = http.createServer(app)

server.listen(port, () => {
    console.log(`Listening from port: ${port}`)
})