const axios2 = require("axios");

const axios = {
    post: async (...args) => {
        try {
            return await axios2.post(...args)
        } catch (e) {
            return e.response
        }
    },
    get: async (...args) => {
        try {
            return await axios2.get(...args)
        } catch (e) {
            return e.response
        }
    },
    put: async (...args) => {
        try {
            return await axios2.put(...args)
        } catch (e) {
            return e.response
        }
    },
    delete: async (...args) => {
        try {
            return await axios2.delete(...args)
        } catch (e) {
            return e.response
        }
    },
}

module.exports = { axios }
