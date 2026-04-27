export type CreateTagDTO = {
    id: number;
    tag: string;
    tagGroupId: number;
    unitLevel: number;
}

export type UpdateTagDTO = {
    id: number;
    tag: string;
    tagGroupId: number;
    unitLevel: number;
}

export type DeleteTagDTO = {
    id: number;
}