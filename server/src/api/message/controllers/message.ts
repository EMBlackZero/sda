import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::message.message', ({ strapi }) => ({
    async create(ctx) {
        const response = await super.create(ctx);

        (strapi as any).io.emit('newMessage', response);

        return response;
    },

    async find(ctx) {
        const messages = await super.find(ctx);
        return messages;
    },

    async deleteAll(ctx) {
        try {
            const deletedData = await strapi.db.query('api::message.message').deleteMany({
                where: {}, 
            });

            console.log(deletedData);

            (strapi as any).io.emit('messagesDeleted', {
                message: 'All messages have been deleted',
                count: deletedData.count,
            });

            return {
                message: 'All messages deleted successfully',
                count: deletedData.count,
            };
        } catch (error) {
            ctx.throw(500, 'Error deleting all messages', { error });
        }
    },
}));
