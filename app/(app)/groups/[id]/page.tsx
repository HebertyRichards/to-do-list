import GroupBoardClient from "./GroupBoardClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupBoardPage({ params }: Props) {
  const { id } = await params;
  return <GroupBoardClient groupSlug={id} />;
}
