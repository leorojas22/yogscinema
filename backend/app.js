const express = require("express");
const tmi = require("tmi.js");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config");
const app = express();

const knex = require("knex")({
    client: 'mysql',
    connection: {
        host		: config.db.host,
        user		: config.db.user,
        password	: config.db.password,
        database	: config.db.database
    }
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(helmet());
app.use(cookieParser());

const { Model } = require("objection");
Model.knex(knex);

const Twitch = require("./helpers/Twitch");

require("./routes.js")(app);
app.use("/user", require("./routes/user"));
app.use("/votes", require("./routes/customvotes"));


const CustomVote = require("./models/CustomVote");
CustomVote.monitorChatForVotes();
if(!config.isDev) {
    
}

app.use(express.static("public"));

// Monitor yogs twitch channel for yogscinema
// Check every 5 minutes
const Cron = require("./helpers/Cron");
setInterval(() => {
    Cron.checkYogsChannel();
}, 300000);

// Check if we shout take a screen shot of the voting options
const Screenshot = require(process.cwd() + "/helpers/Screenshot");
setInterval(() => {
    Screenshot.monitor();
}, 1000);


app.listen(3001, () => {
    console.log("Listening on port 3001");
    Cron.checkYogsChannel();
});
