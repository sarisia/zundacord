// Must stay above every other import: ../zundacord/logger and ../zundacord/i18n
// both read process.env at module-evaluation time.
import "dotenv/config"

import { DEFAULT_LANG, t } from "../zundacord/i18n"
import { logger } from "../zundacord/logger"
import { SlackVoiceDemo } from "./app"
import { getSpeakerInfo, getSpeakers } from "./fixtures"
import { COLOR_SUCCESS, renderConfigAttachment, renderVoiceMessage } from "./blocks/message"
import { renderVoiceModal } from "./blocks/modal"

const log = logger.child({ module: "slackdemo/index" })

function dump(): void {
    // Voidoll has 12 styles, so its dump exercises a heavier `actions` block
    // than 四国めたん's 6 styles — all 12 still wrap into a single block since
    // Slack's per-block cap is 25.
    const sampleSpeaker = getSpeakers().find((s) => s.name === "Voidoll") ?? getSpeakers()[0]
    const sampleStyle = sampleSpeaker.styles[0]
    const tosInfo = getSpeakerInfo(sampleSpeaker.speaker_uuid)
    const savedSpeaker = { styleId: sampleStyle.id, styleName: sampleStyle.name, speaker: sampleSpeaker }

    const modal = renderVoiceModal({
        lang: DEFAULT_LANG,
        responseUrl: "https://hooks.slack.com/actions/T00000000/0000000000/xxxxxxxxxxxxxxxxxxxxxxxx",
        selectedUuid: sampleSpeaker.speaker_uuid,
        ttsEnabled: true,
        savedSpeaker,
        tosInfo,
    })

    const inlineMessage = renderVoiceMessage({
        lang: DEFAULT_LANG,
        selectedUuid: sampleSpeaker.speaker_uuid,
        ttsEnabled: true,
        savedSpeaker,
        tosInfo,
    })

    // Posted on view_closed (only when the modal is dirty), not on submit —
    // there is no submit button anymore.
    const confirmationMessage = {
        response_type: "ephemeral",
        replace_original: false,
        blocks: [],
        attachments: [renderConfigAttachment(
            DEFAULT_LANG, savedSpeaker, true,
            t(DEFAULT_LANG, "embed_voice_updated_title"), COLOR_SUCCESS,
        )],
    }

    console.log(JSON.stringify({ modal, inlineMessage, confirmationMessage }, null, 2))
}

async function main(): Promise<void> {
    if (process.argv.includes("--dump")) {
        dump()
        return
    }

    const botToken = process.env.ZUNDACORD_SLACK_BOT_TOKEN
    const appToken = process.env.ZUNDACORD_SLACK_APP_TOKEN
    if (!botToken || !appToken) {
        throw new Error("ZUNDACORD_SLACK_BOT_TOKEN and ZUNDACORD_SLACK_APP_TOKEN are required")
    }

    const demo = new SlackVoiceDemo(botToken, appToken)
    await demo.start()
}

main().catch((e) => {
    log.error({ err: e }, "fatal error")
    process.exit(1)
})
