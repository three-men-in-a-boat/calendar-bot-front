import CustomContext from "../Models/CustomContext";

export default function getUserName(ctx: CustomContext): string|undefined {
    if (ctx.message) {
        return ctx.message!.from.first_name + ` ${ctx.message!.from.last_name ? ctx.message!.from.last_name : ''}`
    } else {
        if ("callback_query" in ctx.update) {
            return ctx.update.callback_query.from.first_name + ` ${ctx.update.callback_query.from.last_name ? ctx.update.callback_query.from.last_name : ''}`
        }
    }

    return undefined;
}
