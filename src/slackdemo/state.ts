import { getLang, Lang } from "../zundacord/i18n"

export interface MemberConfig {
    ttsEnabled: boolean
    voiceStyleId?: number
    lang: Lang
}

const members = new Map<string, MemberConfig>()

function key(teamId: string, userId: string): string {
    return `${teamId}:${userId}`
}

export function getMemberConfig(teamId: string, userId: string): MemberConfig {
    const stored = members.get(key(teamId, userId))
    return {
        ttsEnabled: true,
        ...stored,
        lang: getLang(stored?.lang),
    }
}

export function setMemberConfig(teamId: string, userId: string, config: MemberConfig): void {
    members.set(key(teamId, userId), config)
}
