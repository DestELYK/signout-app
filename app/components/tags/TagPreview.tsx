import { Tag } from "@prisma/client";
import InfoView, { InfoViewProps } from "../base/InfoView";
import TagGroup from "./TagGroup";

const EXAMPLE_TAGS = [
  {
    id: -100,
    name: "-100",
    color: "gray",
    priority: -100,
    hidden: false,
    category: "example",
  },
  {
    id: -200,
    name: "-50",
    color: "gray",
    priority: -50,
    hidden: false,
    category: "example",
  },
  {
    id: -300,
    name: "-25",
    color: "gray",
    priority: -25,
    hidden: false,
    category: "example",
  },
  {
    id: -400,
    name: "0",
    color: "gray",
    priority: 0,
    hidden: false,
    category: "example",
  },
  {
    id: -500,
    name: "25",
    color: "gray",
    priority: 25,
    hidden: false,
    category: "example",
  },
  {
    id: -600,
    name: "50",
    color: "gray",
    priority: 50,
    hidden: false,
    category: "example",
  },
  {
    id: -700,
    name: "100",
    color: "gray",
    priority: 100,
    hidden: false,
    category: "example",
  },
];

export interface TagPreviewProps {
  tag: Tag;
  previewProps?: InfoViewProps["cardProps"];
}

export default function TagPreview({ tag, previewProps }: TagPreviewProps) {
  const tags = [
    ...EXAMPLE_TAGS.filter((t) =>
      tag.hidden ? true : t.priority !== tag.priority
    ),
    tag,
  ];

  return (
    <InfoView title="Tag Preview" cardProps={previewProps}>
      <TagGroup groupProps={{ justify: "center" }} tags={tags} />
    </InfoView>
  );
}
