type Props = {
  tableName: string;
};

export function TableView({ tableName }: Props) {
  return <div>selected: {tableName}</div>;
}
