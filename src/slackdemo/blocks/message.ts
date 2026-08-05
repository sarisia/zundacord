import { ContextBlock, HeaderBlock, KnownBlock, MessageAttachment, SectionBlock } from "@slack/types"
import { t, Lang } from "../../zundacord/i18n"
import { SpeakerInfo, StyledSpeaker, truncate } from "../fixtures"
import { renderVoiceBlocks, VoiceBlocksOptions } from "./voice"

export const COLOR_SUCCESS = "#47ff94"
export const COLOR_FAILURE = "#ff4a47"
export const COLOR_ACTION = "#45b5ff"

const FOOTER_TEXT = "aria-music/zundacord"

function footerContext(): ContextBlock {
    return {
        type: "context",
        elements: [{ type: "mrkdwn", text: FOOTER_TEXT }],
    }
}

export function renderTtsSection(lang: Lang, ttsEnabled: boolean): SectionBlock {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `*${t(lang, "field_tts_enabled")}*\n${ttsEnabled ? t(lang, "field_value_tts_enabled") : t(lang, "field_value_tts_disabled")}`,
        },
    }
}

export function renderConfigFieldsSection(lang: Lang, speaker: StyledSpeaker | undefined): SectionBlock {
    return {
        type: "section",
        fields: [
            { type: "mrkdwn", text: `*${t(lang, "field_speaker")}*\n${speaker?.speaker.name || t(lang, "field_value_not_set")}` },
            { type: "mrkdwn", text: `*${t(lang, "field_style")}*\n${speaker?.styleName || t(lang, "field_value_not_set")}` },
        ],
    }
}

export function renderConfigAttachment(lang: Lang, speaker: StyledSpeaker | undefined, ttsEnabled: boolean, title?: string, color?: string): MessageAttachment {
    const header: HeaderBlock = {
        type: "header",
        text: { type: "plain_text", text: truncate(title || t(lang, "embed_voice_select_title"), 150) },
    }

    return {
        color: color || COLOR_ACTION,
        blocks: [header, renderTtsSection(lang, ttsEnabled), renderConfigFieldsSection(lang, speaker), footerContext()],
    }
}

export function renderTosAttachment(lang: Lang, info: SpeakerInfo): MessageAttachment {
    const header: HeaderBlock = {
        type: "header",
        text: { type: "plain_text", text: truncate(t(lang, "embed_tos_title"), 150) },
    }

    const section: SectionBlock = {
        type: "section",
        text: { type: "mrkdwn", text: truncate(info.policy, 3000) },
    }

    return {
        color: COLOR_ACTION,
        blocks: [header, section],
    }
}

export function renderVoiceMessage(opts: VoiceBlocksOptions): { blocks: KnownBlock[] } {
    const header: HeaderBlock = {
        type: "header",
        text: { type: "plain_text", text: truncate(t(opts.lang, "embed_voice_select_title"), 150) },
    }

    return { blocks: [header, ...renderVoiceBlocks(opts)] }
}

export function renderErrorMessage(lang: Lang): { blocks: KnownBlock[], attachments: MessageAttachment[] } {
    return {
        blocks: [],
        attachments: [{
            color: COLOR_FAILURE,
            blocks: [
                { type: "header", text: { type: "plain_text", text: truncate(t(lang, "embed_error_title"), 150) } },
                { type: "section", text: { type: "mrkdwn", text: t(lang, "embed_error_description") } },
            ],
        }],
    }
}
