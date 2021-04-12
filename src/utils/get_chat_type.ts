import CustomContext from "../Models/CustomContext";

export default function getChatType(ctx: CustomContext): "private" | "group" | "channel" | "supergroup" | undefined {
    if (ctx.message) {
        return ctx.message.chat.type
    } else {
        if ("callback_query" in ctx.update) {
            return ctx.update.callback_query.message!.chat.type
        }
    }

    return undefined;
}
