import { App } from "@slack/bolt"
import type {
    AllMiddlewareArgs,
    BlockAction,
    BlockButtonAction,
    BlockStaticSelectAction,
    SlackActionMiddlewareArgs,
    SlackCommandMiddlewareArgs,
    SlackViewMiddlewareArgs,
    ViewClosedAction,
} from "@slack/bolt"
import type { RespondFn } from "@slack/bolt"
import axios from "axios"
import { DEFAULT_LANG, Lang, t } from "../zundacord/i18n"
import { logger } from "../zundacord/logger"
import { getSpeakerById, getSpeakerInfo, StyledSpeaker } from "./fixtures"
import { COLOR_SUCCESS, renderConfigAttachment, renderErrorMessage, renderVoiceMessage } from "./blocks/message"
import { ModalPrivateMetadata, renderErrorModal, renderVoiceModal, VoiceModalOptions } from "./blocks/modal"
import { getMemberConfig, setMemberConfig } from "./state"
import { ACTION_SPEAKER_SELECT, ACTION_STYLE_SELECT_PATTERN, ACTION_TTS_ENABLED_PATTERN, CALLBACK_MODAL, isTtsEnableActionId } from "./ids"

const log = logger.child({ module: "slackdemo/app" })

function currentConfig(teamId: string, userId: string): { lang: Lang, ttsEnabled: boolean, savedSpeaker?: StyledSpeaker } {
    const cfg = getMemberConfig(teamId, userId)
    const savedSpeaker = cfg.voiceStyleId !== undefined ? getSpeakerById(cfg.voiceStyleId) : undefined
    return { lang: cfg.lang, ttsEnabled: cfg.ttsEnabled, savedSpeaker }
}

async function postConfigMessage(responseUrl: string, lang: Lang, savedSpeaker: StyledSpeaker | undefined, ttsEnabled: boolean): Promise<void> {
    await axios.post(responseUrl, {
        response_type: "ephemeral",
        replace_original: false,
        blocks: [],
        attachments: [renderConfigAttachment(
            lang, savedSpeaker, ttsEnabled,
            t(lang, "embed_voice_updated_title"), COLOR_SUCCESS,
        )],
    })
}

export class SlackVoiceDemo {
    private readonly app: App

    constructor(botToken: string, appToken: string) {
        this.app = new App({
            token: botToken,
            appToken,
            socketMode: true,
        })

        this.app.command("/voice", this.slashVoice.bind(this))
        this.app.action<BlockStaticSelectAction>(ACTION_SPEAKER_SELECT, this.actionSpeakerSelected.bind(this))
        this.app.action<BlockButtonAction>(ACTION_STYLE_SELECT_PATTERN, this.actionStyleSelected.bind(this))
        this.app.action<BlockButtonAction>(ACTION_TTS_ENABLED_PATTERN, this.actionTtsEnabledSelected.bind(this))
        this.app.view({ callback_id: CALLBACK_MODAL, type: "view_closed" }, this.viewModalClosed.bind(this))
    }

    async start(): Promise<void> {
        await this.app.start()
        log.info("Slack demo connected via Socket Mode!")
    }

    private async respondMessageError(respond: RespondFn): Promise<void> {
        try {
            const { blocks, attachments } = renderErrorMessage(DEFAULT_LANG)
            await respond({ response_type: "ephemeral", replace_original: true, blocks, attachments })
        } catch (e) {
            log.error({ err: e }, "failed to respond with error message")
        }
    }

    private async updateViewError(client: App["client"], viewId: string): Promise<void> {
        try {
            await client.views.update({ view_id: viewId, view: renderErrorModal(DEFAULT_LANG) })
        } catch (e) {
            log.error({ err: e }, "failed to update view with error")
        }
    }

    private async renderSurface(body: BlockAction, respond: RespondFn, client: App["client"], opts: VoiceModalOptions): Promise<void> {
        if (body.view) {
            await client.views.update({ view_id: body.view.id, hash: body.view.hash, view: renderVoiceModal(opts) })
        } else {
            await respond({ replace_original: true, ...renderVoiceMessage(opts) })
        }
    }

    async slashVoice({ command, ack, respond, client }: SlackCommandMiddlewareArgs & AllMiddlewareArgs) {
        await ack()

        const teamId = command.team_id
        const userId = command.user_id
        const ctx = { teamId, userId }
        log.debug(ctx, "handling /voice")

        try {
            const { lang, ttsEnabled, savedSpeaker } = currentConfig(teamId, userId)

            if (command.text.trim().toLowerCase() === "dialog") {
                const view = renderVoiceModal({
                    lang,
                    responseUrl: command.response_url,
                    ttsEnabled,
                    savedSpeaker,
                })
                await client.views.open({ trigger_id: command.trigger_id, view })
            } else {
                await respond({
                    response_type: "ephemeral",
                    replace_original: false,
                    ...renderVoiceMessage({ lang, ttsEnabled, savedSpeaker }),
                })
            }
        } catch (e) {
            log.error({ ...ctx, err: e }, "unhandled error")
            await this.respondMessageError(respond)
        }
    }

    async actionSpeakerSelected({ action, body, ack, client, respond }: SlackActionMiddlewareArgs<BlockStaticSelectAction> & AllMiddlewareArgs) {
        await ack()

        const uuid = action.selected_option.value
        const teamId = body.team?.id ?? "unknown"
        const userId = body.user.id
        const ctx = { teamId, userId, uuid }
        log.debug(ctx, "handling speaker select")

        try {
            const { lang, ttsEnabled, savedSpeaker } = currentConfig(teamId, userId)
            const tosInfo = getSpeakerInfo(uuid)

            const metadata: ModalPrivateMetadata = body.view ? JSON.parse(body.view.private_metadata || "{}") : {}

            await this.renderSurface(body, respond, client, {
                lang,
                responseUrl: metadata.responseUrl,
                selectedUuid: uuid,
                ttsEnabled,
                savedSpeaker,
                tosInfo,
                dirty: metadata.dirty,
            })
        } catch (e) {
            log.error({ ...ctx, err: e }, "unhandled error")
            if (body.view) {
                await this.updateViewError(client, body.view.id)
            } else {
                await this.respondMessageError(respond)
            }
        }
    }

    async actionStyleSelected({ action, body, ack, client, respond }: SlackActionMiddlewareArgs<BlockButtonAction> & AllMiddlewareArgs) {
        await ack()

        const styleId = parseInt(action.value ?? "", 10)
        const teamId = body.team?.id ?? "unknown"
        const userId = body.user.id
        const ctx = { teamId, userId, styleId }
        log.debug(ctx, "handling style select")

        try {
            const speaker = getSpeakerById(styleId)
            if (!speaker) {
                throw new Error(`styleId does not exist: ${styleId}`)
            }

            setMemberConfig(teamId, userId, { ...getMemberConfig(teamId, userId), voiceStyleId: speaker.styleId })

            const selectedUuid = speaker.speaker.speaker_uuid
            const tosInfo = getSpeakerInfo(selectedUuid)
            const { lang, ttsEnabled, savedSpeaker } = currentConfig(teamId, userId)
            const metadata: ModalPrivateMetadata = body.view ? JSON.parse(body.view.private_metadata || "{}") : {}

            await this.renderSurface(body, respond, client, {
                lang,
                responseUrl: metadata.responseUrl,
                selectedUuid,
                ttsEnabled,
                savedSpeaker,
                tosInfo,
                dirty: true,
            })
        } catch (e) {
            log.error({ ...ctx, err: e }, "unhandled error")
            if (body.view) {
                await this.updateViewError(client, body.view.id)
            } else {
                await this.respondMessageError(respond)
            }
        }
    }

    async actionTtsEnabledSelected({ action, body, ack, client, respond }: SlackActionMiddlewareArgs<BlockButtonAction> & AllMiddlewareArgs) {
        await ack()

        const ttsEnabled = isTtsEnableActionId(action.action_id)
        const selectedUuid = action.value
        const teamId = body.team?.id ?? "unknown"
        const userId = body.user.id
        const ctx = { teamId, userId, ttsEnabled }
        log.debug(ctx, "handling tts enabled select")

        try {
            setMemberConfig(teamId, userId, { ...getMemberConfig(teamId, userId), ttsEnabled })

            const tosInfo = selectedUuid ? getSpeakerInfo(selectedUuid) : undefined
            const { lang, savedSpeaker } = currentConfig(teamId, userId)
            const metadata: ModalPrivateMetadata = body.view ? JSON.parse(body.view.private_metadata || "{}") : {}

            await this.renderSurface(body, respond, client, {
                lang,
                responseUrl: metadata.responseUrl,
                selectedUuid,
                ttsEnabled,
                savedSpeaker,
                tosInfo,
                dirty: true,
            })
        } catch (e) {
            log.error({ ...ctx, err: e }, "unhandled error")
            if (body.view) {
                await this.updateViewError(client, body.view.id)
            } else {
                await this.respondMessageError(respond)
            }
        }
    }

    async viewModalClosed({ view, body, ack }: SlackViewMiddlewareArgs<ViewClosedAction> & AllMiddlewareArgs) {
        await ack()

        const teamId = body.team?.id ?? "unknown"
        const userId = body.user.id
        const ctx = { teamId, userId }
        log.debug(ctx, "handling modal close")

        try {
            const metadata: ModalPrivateMetadata = JSON.parse(view.private_metadata || "{}")
            if (!metadata.dirty || !metadata.responseUrl) {
                return
            }

            const { lang, ttsEnabled, savedSpeaker } = currentConfig(teamId, userId)
            await postConfigMessage(metadata.responseUrl, lang, savedSpeaker, ttsEnabled)
        } catch (e) {
            log.error({ ...ctx, err: e }, "failed to post config message")
        }
    }
}
