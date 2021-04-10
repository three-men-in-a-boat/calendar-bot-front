import CustomContext from "../Models/CustomContext";

export default async function sendError(ctx: CustomContext, text: string) {
    if (ctx.scene.session.create_event.error_message_id !== 0) {
        await ctx.telegram.deleteMessage(ctx.scene.session.create_event.cid,
            ctx.scene.session.create_event.error_message_id)
    }
    ctx.telegram.sendMessage(
        ctx.scene.session.create_event.cid,
        text)
        .then(m => {
            ctx.scene.session.create_event.error_message_id = m.message_id;
        })
}
