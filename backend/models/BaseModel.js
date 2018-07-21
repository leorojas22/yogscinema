const { Model } = require("objection");

class BaseModel extends Model {
    static async create(fields = {}) {
        return await this.query().insert(fields);	
    }


    static async getOrCreate(fields = {}) {
        let self = this;
        return await this.find(fields).then(result => {
            // Found User
            return result;
        })
        .catch(async err => {
            return await this.create(fields);
        })
    }

    static async findMany(where = {}) {
        let foundModel = await this.query().where(where);

        if(foundModel.length > 0) {
            return await foundModel;
        }

        return Promise.reject(false);
    }

    static async find(where = {}) {
        let foundModel = await this.query().where(where).limit(1);

        if(foundModel.length > 0) {
            return await foundModel[0];
        }

        return Promise.reject(false);
    }
}

module.exports = BaseModel;
