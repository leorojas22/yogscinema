const { Model } = require("objection");

class BaseModel extends Model {
    static async create(fields = {}) {
        return await this.query().insert(fields);
    }

    get usesSoftDeletes() {
        return true;
    }

    async delete() {
        if(this.usesSoftDeletes) {
            // Soft delete
            return await this.constructor.query().update({ deleted: new Date() }).where({ id: this.id, deleted: null });
        }
        else {
            // Hard delete
            return await this.constructor.query().where({ id: this.id }).del();
        }
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

    static async findMany(where = {}, orderBy = "id") {
        let foundModel = await this.query().where(where).orderByRaw(orderBy);

        if(foundModel.length > 0) {
            return await foundModel;
        }

        return Promise.reject(false);
    }

    static async find(where = {}, queryModifier = null) {
        let query = this.query().where(where).limit(1);
        if(queryModifier) {
            query = queryModifier(query);
        }


        return await new Promise((resolve, reject) => {

            query.then(model => {
                if(model.length > 0) {
                    resolve(model[0]);
                }
                else
                {
                    reject(false);
                }
            })
            .catch(err => {
                console.log(err);
                reject(false);
            });


            /*
            if(foundModel.length > 0) {
                return await foundModel[0];
            }

            return false;*/
        });
    }
}

module.exports = BaseModel;
