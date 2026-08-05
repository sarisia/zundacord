import { ActionsBlock, KnownBlock, PlainTextOption, SectionBlock } from "@slack/types"
import { t, Lang } from "../../zundacord/i18n"
import { SpeakerInfo, StyledSpeaker, getSpeakers, getSpeakerByUUID, truncate } from "../fixtures"
import { ACTION_SPEAKER_SELECT, styleActionId, ttsActionId } from "../ids"
import { renderConfigFieldsSection, renderTtsSection } from "./message"

export interface VoiceBlocksOptions {
    lang: Lang
    selectedUuid?: string
    ttsEnabled: boolean
    savedSpeaker?: StyledSpeaker
    tosInfo?: SpeakerInfo
}

function speakerSelectSection(lang: Lang, selectedUuid?: string): SectionBlock {
    const speakers = getSpeakers()

    const options: PlainTextOption[] = speakers.map((s) => ({
        text: { type: "plain_text", text: s.name },
        description: { type: "plain_text", text: truncate(s.styles.map((st) => st.name).join(", "), 75) },
        value: s.speaker_uuid,
    }))
    const selected = options.find((o) => o.value === selectedUuid)

    return {
        type: "section",
        text: { type: "mrkdwn", text: `*${t(lang, "field_speaker")}*` },
        accessory: {
            type: "static_select",
            action_id: ACTION_SPEAKER_SELECT,
            placeholder: { type: "plain_text", text: t(lang, "select_speaker_placeholder") },
            options,
            ...(selected ? { initial_option: selected } : {}),
        },
    }
}

const STYLE_BUTTONS_PER_BLOCK = 25

function styleButtonBlocks(lang: Lang, speakerUuid: string): KnownBlock[] {
    const speaker = getSpeakerByUUID(speakerUuid)
    if (!speaker) {
        throw new Error(`speakerUuid does not exist: ${speakerUuid}`)
    }

    const heading: SectionBlock = {
        type: "section",
        text: { type: "mrkdwn", text: `*${t(lang, "field_style")}*` },
    }

    const rows: KnownBlock[] = []
    for (let i = 0; i < speaker.styles.length; i += STYLE_BUTTONS_PER_BLOCK) {
        rows.push({
            type: "actions",
            elements: speaker.styles.slice(i, i + STYLE_BUTTONS_PER_BLOCK).map((st) => ({
                type: "button",
                text: { type: "plain_text", text: truncate(st.name, 75) },
                action_id: styleActionId(st.id),
                value: String(st.id),
                style: "primary",
            })),
        })
    }

    return [heading, ...rows]
}

function ttsButtonBlocks(lang: Lang, ttsEnabled: boolean, selectedUuid?: string): KnownBlock[] {
    const actions: ActionsBlock = {
        type: "actions",
        elements: [
            {
                type: "button",
                text: { type: "plain_text", text: t(lang, "button_tts_enable") },
                action_id: ttsActionId(true),
                ...(selectedUuid ? { value: selectedUuid } : {}),
                style: "primary",
            },
            {
                type: "button",
                text: { type: "plain_text", text: t(lang, "button_tts_disable") },
                action_id: ttsActionId(false),
                ...(selectedUuid ? { value: selectedUuid } : {}),
                style: "danger",
            },
        ],
    }

    return [renderTtsSection(lang, ttsEnabled), actions]
}

function tosSection(lang: Lang, info: SpeakerInfo): SectionBlock {
    return {
        type: "section",
        text: { type: "mrkdwn", text: truncate(`*${t(lang, "embed_tos_title")}*\n${info.policy}`, 3000) },
    }
}

export function renderVoiceBlocks(opts: VoiceBlocksOptions): KnownBlock[] {
    const { lang, selectedUuid, ttsEnabled, savedSpeaker, tosInfo } = opts

    return [
        renderConfigFieldsSection(lang, savedSpeaker),
        speakerSelectSection(lang, selectedUuid),
        ...(selectedUuid ? styleButtonBlocks(lang, selectedUuid) : []),
        ...ttsButtonBlocks(lang, ttsEnabled, selectedUuid),
        ...(selectedUuid && tosInfo ? [tosSection(lang, tosInfo)] : []),
    ]
}
