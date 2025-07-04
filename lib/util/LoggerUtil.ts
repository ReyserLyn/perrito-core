import { DateTime } from 'luxon'
import { SPLAT } from 'triple-beam'
import { inspect } from 'util'
import { createLogger, format, Logger, transports } from 'winston'

export class LoggerUtil {

    public static getLogger(label: string): Logger {
        return createLogger({
            format: format.combine(
                format.label(),
                format.colorize(),
                format.label({ label }),
                format.printf(infoUnknown => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const info = infoUnknown as {[key: string | symbol]: any}
                    if(info[SPLAT]) {
                        if(info[SPLAT].length === 1 && info[SPLAT][0] instanceof Error) {
                            const err: Error = info[SPLAT][0]
                            if(info.message.length > err.message.length && info.message.endsWith(err.message)) {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                info.message = info.message.substring(0, info.message.length-err.message.length)
                            }
                        } else if(info[SPLAT].length > 0) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            info.message += ' ' + info[SPLAT].map((it: any) => {
                                if(typeof it === 'object' && it != null) {
                                    return inspect(it, false, null, true)
                                }
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                return it
                            }).join(' ')
                        }
                    }
                    return `[${DateTime.local().toFormat('yyyy-MM-dd TT').trim()}] [${info.level}] [${info.label}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
                })
            ),
            level: process.env.NODE_ENV === 'test' ? 'emerg' : 'debug',
            transports: [
                new transports.Console()
            ]
        })
    }

}