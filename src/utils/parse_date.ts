import CustomContext from "../Models/CustomContext";
import sendDateError from "./send_date_error";

export default async function parseDate(ctx: CustomContext, message: string): Promise<Date | undefined> {
    let parsed_date = message.split(' ');
    if (parsed_date.length !== 2) {
        await sendDateError(ctx);
        return undefined;
    }
    let parsed_buf = parsed_date[0].split('.');
    if (parsed_buf.length !== 3) {
        await sendDateError(ctx);
        return undefined;
    }
    const buf = parsed_buf[0];
    parsed_buf[0] = parsed_buf[2];
    parsed_buf[2] = buf;
    parsed_date[0] = parsed_buf.join('.');
    const date = new Date(parsed_date.join(' '));
    if (date) {
        if (ctx.scene.session.create_event.error_message_id !== 0) {
            await ctx.telegram.deleteMessage(ctx.scene.session.create_event.cid,
                ctx.scene.session.create_event.error_message_id)
        }
        return date
    } else {
        await sendDateError(ctx);
        return undefined;
    }
}
