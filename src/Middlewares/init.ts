import CustomContext from "../Models/CustomContext";

export default async function InitMiddleware(ctx: CustomContext, next: Function) {
    ctx.session_data ??= ''
    ctx.scene.session.actionName ??= ''
    ctx.scene.session.create_event ??= {
        created: false,
        curr_step: 'TITLE',
        event: {
            uid:new Date(Date.now()).toISOString(),
            title: "",
            from: "",
            to: "",
            description: ""
        },
        mid: 0,
        cid: 0,
        error_message_id: 0
    }
    return next()
}
