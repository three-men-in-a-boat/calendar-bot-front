import CustomContext from "../Models/CustomContext";

export default function getMessageId(ctx: CustomContext): number | undefined {
    if (ctx.message) {
        return ctx.message.message_id
    } else {
        if ("callback_query" in ctx.update) {
            return ctx.update.callback_query.message!.message_id
        }
    }

    return undefined;
}
