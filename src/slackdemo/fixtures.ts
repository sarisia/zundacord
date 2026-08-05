// Hardcoded VOICEVOX speaker fixture for the Slack Block Kit UI demo.
// Structurally identical to (but independent of) src/zundacord/voicevox.ts,
// since Speaker there isn't exported and this demo must not touch that file.

export interface Speaker {
    readonly name: string
    readonly speaker_uuid: string
    readonly styles: {
        readonly name: string
        readonly id: number
    }[]
}

export interface StyledSpeaker {
    readonly styleId: number
    readonly styleName: string
    readonly speaker: Speaker
}

export interface SpeakerInfo {
    readonly policy: string
}

// sequential style ids across all speakers, mirroring how the real
// VOICEVOX engine assigns them
let _nextStyleId = 0
function styles(...names: string[]): { name: string, id: number }[] {
    return names.map((name) => ({ name, id: _nextStyleId++ }))
}

export const SPEAKERS: Speaker[] = [
    { name: "四国めたん", speaker_uuid: "7ffcb7ce-00ec-4bdc-82cd-45a8889e43ff", styles: styles("ノーマル", "あまあま", "ツンツン", "セクシー", "ささやき", "ヒソヒソ") },
    { name: "ずんだもん", speaker_uuid: "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9", styles: styles("ノーマル", "あまあま", "ツンツン", "セクシー", "ささやき", "ヒソヒソ", "ヘロヘロ", "なみだめ") },
    { name: "春日部つむぎ", speaker_uuid: "35b2c544-660e-401e-b503-0e14c635303a", styles: styles("ノーマル") },
    { name: "雨晴はう", speaker_uuid: "3474ee95-c274-47f9-aa1a-8523c85a85f1", styles: styles("ノーマル") },
    { name: "波音リツ", speaker_uuid: "b1a81618-b27b-40d2-b0ea-27a9ad408c4b", styles: styles("ノーマル", "クイーン") },
    { name: "玄野武宏", speaker_uuid: "c30dc15a-0992-4f8d-8bb8-ad3b314e6a6f", styles: styles("ノーマル", "喜び", "ツンギレ", "悲しみ") },
    { name: "白上虎太郎", speaker_uuid: "e5020595-5c5d-4e87-b849-270a518d0dcd", styles: styles("ふつう", "わーい", "びくびく", "おこ", "びえーん") },
    { name: "青山龍星", speaker_uuid: "4f51116a-d9ee-4516-925d-21f183209515", styles: styles("ノーマル", "熱血", "不機嫌", "喜び", "しっとり", "かなしみ", "囁き") },
    { name: "冥鳴ひまり", speaker_uuid: "0693554c-b514-4b87-a17a-4d1fdd8f0f8e", styles: styles("ノーマル") },
    { name: "九州そら", speaker_uuid: "481a09ef-4e57-4f8e-95ac-2d38b1bcfaef", styles: styles("ノーマル", "あまあま", "ツンツン", "セクシー", "ささやき") },
    { name: "もち子さん", speaker_uuid: "9f3ee141-26ad-437e-97bd-38c2c1c4210f", styles: styles("ノーマル", "セクシー／有咳", "泣き", "怒り", "喜び", "のんびり") },
    { name: "剣崎雌雄", speaker_uuid: "1a17ca16-7ee5-4ea5-b191-2f02ace24d21", styles: styles("ノーマル") },
    { name: "WhiteCUL", speaker_uuid: "67d5d8da-acd7-4207-bb10-b5542d3a663b", styles: styles("ノーマル", "たのしい", "かなしい", "びえーん") },
    { name: "後鬼", speaker_uuid: "0f56c2f2-644c-49c9-8989-96e4297bc4b6", styles: styles("人間ver.", "ぬいぐるみver.") },
    { name: "No.7", speaker_uuid: "0f56c2f2-644c-49c9-8989-96e4297bc4b7", styles: styles("ノーマル", "アナウンス", "読み聞かせ") },
    { name: "ちび式じい", speaker_uuid: "b28d225e-0f92-4f7b-9718-72c8cfc78d5e", styles: styles("ノーマル") },
    { name: "櫻歌ミコ", speaker_uuid: "0693554c-b514-4b87-a17a-4d1fdd8f0f8f", styles: styles("ノーマル", "第二形態", "ロリ") },
    { name: "小夜/SAYO", speaker_uuid: "a8cc6d22-aad0-4ab8-bf1e-2f843924b18b", styles: styles("ノーマル") },
    { name: "ナースロボ＿タイプＴ", speaker_uuid: "882a636f-3bac-431a-966d-c5e6bba9f949", styles: styles("ノーマル", "楽々", "恐怖", "内緒話") },
    { name: "†聖騎士 紅桜†", speaker_uuid: "cc8eda0e-482c-4d94-8bef-2a3121ebeeb2", styles: styles("ノーマル") },
    { name: "雀松朱司", speaker_uuid: "7d1e7ba7-e754-4b1e-b421-bd0d78e824f5", styles: styles("ノーマル") },
    { name: "麒ヶ島宗麟", speaker_uuid: "cf419292-a94a-4118-97b1-3e9c6f7ee440", styles: styles("ノーマル") },
    { name: "春歌ナナ", speaker_uuid: "35134dd8-ba8b-4f0f-b96b-9b0470909a86", styles: styles("ノーマル") },
    { name: "猫使アル", speaker_uuid: "00a5c10b-4e2c-4a4d-9c02-9c4c1e5c4f2c", styles: styles("ノーマル", "おちつき", "うきうき") },
    { name: "猫使ビィ", speaker_uuid: "c98db99b-8db2-4a44-b2eb-c2edb9dee87b", styles: styles("ノーマル", "おちつき", "人見知り") },
    { name: "中国うさぎ", speaker_uuid: "1f18edcf-4489-4904-9c05-a1dbef6e8d16", styles: styles("ノーマル", "おどろき", "こわがり", "へろへろ") },
    { name: "栗田まろん", speaker_uuid: "cfd4c639-30e5-4e5a-9f9c-5c0d0e4c2d4e", styles: styles("ノーマル") },
    { name: "あいえるたん", speaker_uuid: "51431898-1b7e-4735-8f4e-e5ec9e8f9bb4", styles: styles("ノーマル") },
    { name: "満別花丸", speaker_uuid: "3e2ec80a-c8c4-4b7d-b4a5-2c5e7f9c0a5e", styles: styles("ノーマル", "元気", "ひどぶりっ子", "under construction") },
    { name: "琴詠ニア", speaker_uuid: "94ee9a49-1116-4dcf-8dcb-963a8dfa17b3", styles: styles("ノーマル") },
    { name: "Voidoll", speaker_uuid: "e35c37d3-6a1a-4c2b-8e2a-5c5e0e1c9a3d", styles: styles("ノーマル", "ぶりっ子", "ノーマル(明るめ)", "ぶりっ子(明るめ)", "怒り", "ノーマル(声低め)", "落ち着き", "囁き", "早口", "怯え", "感情なし", "元気") },
]

const speakersUuidMap = new Map<string, Speaker>()
const speakersIdMap = new Map<number, StyledSpeaker>()
for (const s of SPEAKERS) {
    speakersUuidMap.set(s.speaker_uuid, s)
    for (const st of s.styles) {
        speakersIdMap.set(st.id, { styleId: st.id, styleName: st.name, speaker: s })
    }
}

const policyStub = (name: string): string =>
    `${name} の利用規約（デモ用ダミーテキスト）です。実際の利用にあたっては、各キャラクターの公式利用規約を必ず確認してください。` +
    "本キャラクターの音声・素材は、非商用・商用を問わずご利用いただけますが、公序良俗に反する用途や、他者を誹謗中傷する目的でのご利用はお控えください。" +
    "作品を公開する際は、可能な範囲でクレジット表記にご協力ください。"

export function getSpeakers(): Speaker[] {
    return SPEAKERS
}

export function getSpeakerByUUID(uuid: string): Speaker | undefined {
    return speakersUuidMap.get(uuid)
}

export function getSpeakerById(styleId: number): StyledSpeaker | undefined {
    return speakersIdMap.get(styleId)
}

export function getSpeakerInfo(uuid: string): SpeakerInfo {
    const speaker = speakersUuidMap.get(uuid)
    return { policy: policyStub(speaker?.name ?? uuid) }
}

export function truncate(s: string, n: number): string {
    if (s.length <= n) {
        return s
    }
    return s.slice(0, Math.max(0, n - 1)) + "…"
}
