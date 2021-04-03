import CustomContext from "../Models/CustomContext";

export default async function sendDateError(ctx: CustomContext) {
    if (ctx.scene.session.create_event.error_message_id !== 0) {
        await ctx.telegram.deleteMessage(ctx.scene.session.create_event.cid,
            ctx.scene.session.create_event.error_message_id)
    }
    ctx.telegram.sendMessage(
        ctx.scene.session.create_event.cid,
        'Введите дату по фомат ДД.ММ.ГГГГ ЧЧ.ММ (21.03.2021 18:00)')
        .then(m => {
            ctx.scene.session.create_event.error_message_id = m.message_id;
        })
}
