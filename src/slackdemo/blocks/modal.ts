import { KnownBlock, ModalView } from "@slack/types"
import { t, Lang } from "../../zundacord/i18n"
import { truncate } from "../fixtures"
import { CALLBACK_MODAL } from "../ids"
import { renderVoiceBlocks, VoiceBlocksOptions } from "./voice"

const MODAL_CLOSE_LABEL: Record<Lang, string> = { ja: "閉じる", en: "Close" }

export interface ModalPrivateMetadata {
    responseUrl?: string
    dirty?: boolean
}

export type VoiceModalOptions = VoiceBlocksOptions & {
    responseUrl?: string
    dirty?: boolean
}

export function renderVoiceModal(opts: VoiceModalOptions): ModalView {
    const { lang, responseUrl, dirty } = opts

    const metadata: ModalPrivateMetadata = { responseUrl, dirty }

    const blocks: KnownBlock[] = renderVoiceBlocks(opts)

    return {
        type: "modal",
        callback_id: CALLBACK_MODAL,
        private_metadata: JSON.stringify(metadata),
        title: { type: "plain_text", text: truncate(t(lang, "embed_voice_select_title"), 24) },
        notify_on_close: true,
        close: { type: "plain_text", text: MODAL_CLOSE_LABEL[lang] },
        blocks,
    }
}

export function renderErrorModal(lang: Lang): ModalView {
    return {
        type: "modal",
        callback_id: CALLBACK_MODAL,
        title: { type: "plain_text", text: truncate(t(lang, "embed_error_title"), 24) },
        close: { type: "plain_text", text: MODAL_CLOSE_LABEL[lang] },
        blocks: [
            { type: "section", text: { type: "mrkdwn", text: t(lang, "embed_error_description") } },
        ],
    }
}
