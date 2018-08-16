const BaseModel = require(process.cwd() + "/models/BaseModel");
const YogsDB = require(process.cwd() + "/helpers/YogsDB");
const tmi = require("tmi.js");
const config = require(process.cwd() + "/config");

class VoteAdd extends BaseModel {

    static get tableName() {
        return "vote_add";
    }



}

module.exports = VoteAdd;
