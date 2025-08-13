import { EXAMPLE_TAGS } from "~/utils/consts";
import { TagData } from "~/utils/types.server";
import InfoView, { InfoViewProps } from "../base/InfoView";
import TagGroup from "./TagGroup";

export interface TagPreviewProps {
    tag: TagData;
    previewProps?: InfoViewProps["cardProps"];
}

export default function TagPreview({ tag, previewProps }: TagPreviewProps) {
    const tags: TagData[] = [
        ...EXAMPLE_TAGS.filter((t) => (tag.hidden ? true : t.priority !== tag.priority)),
        { ...tag, description: "Preview Tag" },
    ];

    return (
        <InfoView title="Tag Preview" cardProps={previewProps}>
            <TagGroup groupProps={{ justify: "center" }} tags={tags} />
        </InfoView>
    );
}
