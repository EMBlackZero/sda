// src/api/message/routes/custom.ts
module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/messages/delete-all',
            handler: 'message.deleteAll', // ใช้ message เพราะเป็น core controller
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};